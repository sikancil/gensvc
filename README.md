# GenSvc - Backend Service Generator

**GenSvc** is a powerful and configurable CLI tool designed to automate the creation of backend services and microservices, primarily using the NestJS framework. It simplifies the process of starting new projects by scaffolding a production-ready codebase with pre-configured modules for common backend features.

## Vision

The goal of this project is to provide a flexible boilerplate generator that can adapt to various architectural needs, from simple standalone services to complex, distributed microservice systems. By automating repetitive setup tasks, GenSvc allows developers to focus on business logic, saving time and reducing human error.

## Features

This CLI tool will be built in phases. Key features will include:

- **Interactive CLI:** An easy-to-use, prompt-based interface for configuring your new service.
- **Framework Support:** Initial support for NestJS, with potential for ExpressJS in the future.
- **Database Options:** Choice of ORM between Prisma and Sequelize.
- **Authentication:** Pre-configured authentication modules (Email/Password, Google OAuth2, Firebase Auth).
- **Microservice Architecture:** Support for generating API Gateways and microservices with transport layers like Redis or Kafka.
- **Common Modules:** Built-in support for caching, task queues, WebSockets, logging, and more.
- **Monorepo Support:** Seamless integration with monorepo workspaces.

## Getting Started

*(Instructions to be added once the CLI is functional)*

```bash
# Installation (coming soon)
npm install -g gensvc

# Usage
gensvc generate
```

## Project Plan

The development of this tool is broken down into the following phases:

1.  **Core Scaffolding & Foundational Features:** Build the core CLI, generate a basic NestJS service, and integrate essential modules like logging, error handling, and validation.
2.  **Database, Auth & Monorepo Support:** Add database integration (Prisma/Sequelize), email/password authentication, and support for monorepo structures.
3.  **Advanced Architecture & Inter-Service Communication:** Implement API Gateway and microservice generation with transport layers (Redis/Kafka), caching, queues, and WebSockets.
4.  **Integrations, Shared Packages & Intelligence:** Add third-party auth providers, create a centralized shared package for monorepos, and explore an AI-powered review feature.

---

This project is currently under active development.
