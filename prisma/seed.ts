import { PrismaClient, SkillCategory, SkillLevel } from '@prisma/client';
import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

/**
 * Путь к profile.json определяется поиском, а не предположением: тот же файл
 * запускается и как prisma/seed.ts под ts-node, и как dist/prisma/seed.js
 * обычным node в контейнере. Фиксированное число переходов вверх верно ровно
 * для одного из двух случаев.
 */
function resolveDataFile(): string {
  const candidates = [
    join(__dirname, 'data', 'profile.json'), // prisma/ — запуск из исходников
    join(__dirname, '..', '..', 'prisma', 'data', 'profile.json'), // dist/prisma/
    join(process.cwd(), 'prisma', 'data', 'profile.json'),
  ];
  const found = candidates.find((path) => existsSync(path));
  if (!found) {
    throw new Error(`profile.json не найден. Проверено: ${candidates.join(', ')}`);
  }
  return found;
}

const prisma = new PrismaClient();

interface ProfileData {
  slug: string;
  name: string;
  headline: string;
  description: string;
  location: string;
  email: string;
  links: { label: string; url: string }[];
  skills: { name: string; category: SkillCategory; level: SkillLevel }[];
  experiences: {
    company: string;
    position: string;
    summary: string;
    startedAt: string;
    finishedAt: string | null;
    achievements: string[];
  }[];
  projects: {
    name: string;
    description: string;
    url: string | null;
    repositoryUrl: string | null;
    stack: string[];
  }[];
}

/**
 * The seed is idempotent: it upserts the profile on its slug and rewrites the
 * children inside one transaction. Running it on every container start is
 * therefore safe, and editing profile.json is enough to update the card.
 */
async function main(): Promise<void> {
  const raw = await readFile(resolveDataFile(), 'utf8');
  const data = JSON.parse(raw) as ProfileData;

  await prisma.$transaction(async (tx) => {
    const profile = await tx.profile.upsert({
      where: { slug: data.slug },
      update: {
        name: data.name,
        headline: data.headline,
        description: data.description,
        location: data.location,
        email: data.email,
      },
      create: {
        slug: data.slug,
        name: data.name,
        headline: data.headline,
        description: data.description,
        location: data.location,
        email: data.email,
      },
    });

    // Children are replaced wholesale: the JSON file is the single source of
    // truth, and cascading deletes keep the graph consistent.
    await tx.link.deleteMany({ where: { profileId: profile.id } });
    await tx.skill.deleteMany({ where: { profileId: profile.id } });
    await tx.experience.deleteMany({ where: { profileId: profile.id } });
    await tx.project.deleteMany({ where: { profileId: profile.id } });

    await tx.link.createMany({
      data: data.links.map((link, position) => ({
        profileId: profile.id,
        label: link.label,
        url: link.url,
        position,
      })),
    });

    await tx.skill.createMany({
      data: data.skills.map((skill) => ({
        profileId: profile.id,
        name: skill.name,
        category: skill.category,
        level: skill.level,
      })),
    });

    for (const experience of data.experiences) {
      await tx.experience.create({
        data: {
          profileId: profile.id,
          company: experience.company,
          position: experience.position,
          summary: experience.summary,
          startedAt: new Date(experience.startedAt),
          finishedAt: experience.finishedAt ? new Date(experience.finishedAt) : null,
          achievements: {
            create: experience.achievements.map((text, position) => ({ text, position })),
          },
        },
      });
    }

    await tx.project.createMany({
      data: data.projects.map((project, position) => ({
        profileId: profile.id,
        name: project.name,
        description: project.description,
        url: project.url,
        repositoryUrl: project.repositoryUrl,
        stack: project.stack,
        position,
      })),
    });

    console.log(`seeded profile "${profile.slug}" (${profile.id})`);
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
