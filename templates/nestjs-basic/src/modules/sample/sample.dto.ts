<% if (includeValidation) { -%>
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const CreateSampleSchema = z.object({
  name: z.string().min(1, { message: 'Name cannot be empty' }),
  age: z.number().int().positive({ message: 'Age must be a positive integer' }),
});

// class is required for using DTO as a type in NestJS
export class CreateSampleDto extends createZodDto(CreateSampleSchema) {}
<% } -%>
