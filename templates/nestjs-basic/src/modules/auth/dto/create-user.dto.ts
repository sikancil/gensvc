<% if (includeAuth) { -%>
<% if (includeValidation) { -%>
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const CreateUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().optional(),
});

export class CreateUserDto extends createZodDto(CreateUserSchema) {}
<% } else { -%>
// Basic DTO without validation
export class CreateUserDto {
    email: string;
    password: string;
    name?: string;
}
<% } -%>
<% } -%>
