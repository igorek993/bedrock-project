#This resource was imported because OIDC Auth works only via console. 
resource "aws_amplify_app" "project_fufel" {
  name                 = "project-fufel"
  platform             = "WEB_COMPUTE"
  repository           = "https://github.com/igorek993/bedrock-project"
  iam_service_role_arn = "arn:aws:iam::992382412567:role/service-role/AmplifySSRLoggingRole-f6aae01a-205e-4e89-b636-df5dbc54f4d7"

  build_spec = <<-EOT
    version: 1
    frontend:
      phases:
        preBuild:
          commands:
            - npm ci --cache .npm --prefer-offline --force
        build:
          commands:
            - npm run build
      artifacts:
        baseDirectory: .next
        files:
          - "**/*"
      cache:
        paths:
          - .next/cache/**/*
          - .npm/**/*
  EOT

  custom_rule {
    source = "/<*>"
    status = "404-200"
    target = "/index.html"

  }
}