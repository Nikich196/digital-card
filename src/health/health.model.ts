import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType({ description: 'Liveness and database connectivity.' })
export class Health {
  @Field({ description: '"ok" when the database answered.' })
  status!: string;

  @Field({ description: 'Seconds since the process started.' })
  uptimeSeconds!: number;

  @Field({ description: 'Round-trip time of a trivial database query, ms.' })
  databaseLatencyMs!: number;
}
