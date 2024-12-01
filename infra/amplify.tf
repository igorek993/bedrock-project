#This resource was imported because OIDC Auth works only via console. 
resource "aws_amplify_app" "project_fufel" {
  name                 = "project-fufel"
  platform             = "WEB_COMPUTE"
  repository           = "https://github.com/igorek993/bedrock-project"
  iam_service_role_arn = aws_iam_role.project_fufel_amplify_role.arn

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

resource "aws_iam_policy" "project_fufel_logging_policy" {
  description = null
  name        = "AmplifySSRLoggingPolicy-f6aae01a-205e-4e89-b636-df5dbc54f4d7"
  name_prefix = null
  path        = "/service-role/"
  policy = jsonencode(
    {
      Statement = [
        {
          Action = [
            "logs:CreateLogStream",
            "logs:PutLogEvents",
          ]
          Effect   = "Allow"
          Resource = "arn:aws:logs:${local.region}:${local.account_id}:log-group:/aws/amplify/*:log-stream:*"
          Sid      = "PushLogs"
        },
        {
          Action   = "logs:CreateLogGroup"
          Effect   = "Allow"
          Resource = "arn:aws:logs:${local.region}:${local.account_id}:log-group:/aws/amplify/*"
          Sid      = "CreateLogGroup"
        },
        {
          Action   = "logs:DescribeLogGroups"
          Effect   = "Allow"
          Resource = "arn:aws:logs:${local.region}:${local.account_id}:log-group:*"
          Sid      = "DescribeLogGroups"
        },
      ]
      Version = "2012-10-17"
    }
  )
  tags     = {}
  tags_all = {}
}

resource "aws_iam_role" "project_fufel_amplify_role" {
  assume_role_policy = jsonencode(
    {
      Statement = [
        {
          Action = "sts:AssumeRole"
          Effect = "Allow"
          Principal = {
            Service = "amplify.amazonaws.com"
          }
        },
      ]
      Version = "2012-10-17"
    }
  )

  description           = "The service role that will be used by AWS Amplify for Web Compute app logging."
  force_detach_policies = false
  max_session_duration  = 3600
  name                  = "AmplifySSRLoggingRole-f6aae01a-205e-4e89-b636-df5dbc54f4d7"
  name_prefix           = null
  path                  = "/service-role/"
  permissions_boundary  = null
  tags                  = {}
  tags_all              = {}
}


resource "aws_iam_role_policy_attachment" "project_fufel_role_logging_policy" {
  role       = aws_iam_role.project_fufel_amplify_role.name
  policy_arn = aws_iam_policy.project_fufel_logging_policy.arn
}

resource "aws_iam_role_policy_attachment" "project_fufel_role_app_policy" {
  role       = aws_iam_role.project_fufel_amplify_role.name
  policy_arn = aws_iam_policy.project_fufel_app_policy.arn
}

resource "aws_iam_policy" "project_fufel_app_policy" {
  name = "project-fufel-app-policy"
  policy = jsonencode(
    {
      Statement = [
        {
          Action = [
            "s3:*",
          ]
          Effect   = "Allow"
          Resource = "*"
          Sid      = "s3Access"
        },
      ]
      Version = "2012-10-17"
    }
  )
}