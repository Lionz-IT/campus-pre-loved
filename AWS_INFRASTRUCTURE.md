# AWS Architecture Plan: campus-preloved

This document outlines the infrastructure required to migrate `campus-preloved` from Vercel/Supabase to AWS.

## Architecture Overview
The application will run as a Docker container on an EC2 instance, connecting to an RDS PostgreSQL database and storing assets in S3.

## Components

### 1. Compute: Amazon EC2
*   **Instance Type**: `t3.medium` (or similar, depending on traffic).
*   **OS**: Ubuntu Server 24.04 LTS.
*   **Role**: Hosts the Docker container running the Next.js application.
*   **Networking**:
    *   Public Subnet: With Elastic IP.
    *   Security Group: Allow HTTP (80) and HTTPS (443) from the internet. Allow SSH (22) from a restricted IP.

### 2. Database: Amazon RDS
*   **Engine**: PostgreSQL (latest stable version).
*   **Instance Type**: `db.t3.micro` or `db.t3.small` (for dev/minimal).
*   **Networking**: Private Subnet.
*   **Access**: Only accessible from the EC2 instance's security group.

### 3. Storage: Amazon S3
*   **Buckets**:
    *   `campus-preloved-product-images`
    *   `campus-preloved-chat-attachments`
*   **Policy**: Public access allowed (or CloudFront origin).

### 4. Container Registry: Amazon ECR
*   **Repository**: `campus-preloved-app`
*   **Role**: Store Docker images built by GitHub Actions.

### 5. CI/CD: GitHub Actions
*   **Workflow**:
    1.  Build Docker image.
    2.  Push to Amazon ECR.
    3.  SSH into EC2.
    4.  Pull latest image from ECR.
    5.  Restart Docker container.

## Environment Variables Mapping (AWS)
| Vercel/Supabase | AWS Mapping |
| :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | N/A (Supabase Client -> Drizzle/API) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | N/A |
| `DATABASE_URL` | `postgresql://user:password@rds-endpoint:5432/dbname` |
| `NEXTAUTH_SECRET` | Required for NextAuth |
| `AWS_ACCESS_KEY_ID` | IAM User Credential |
| `AWS_SECRET_ACCESS_KEY` | IAM User Credential |
| `S3_BUCKET_NAME` | S3 Bucket Name |
