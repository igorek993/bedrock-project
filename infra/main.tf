resource "aws_dynamodb_table" "project_fufel_user_info" {
  name         = "project-fufel-user-info"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "UserId"

  attribute {
    name = "UserId"
    type = "S"
  }
}

resource "aws_s3_bucket" "project_fufel_user_info" {
  bucket = "project-fufel-user-files"
}

resource "aws_s3_bucket_cors_configuration" "project_fufel_cors" {
  bucket = aws_s3_bucket.project_fufel_user_info.id

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["GET", "PUT", "POST", "DELETE"]
    allowed_origins = ["*"]
    expose_headers  = []
  }
}

resource "aws_secretsmanager_secret" "pinecone_api_key" {
  name = "pinecone-api-key"
}

resource "aws_bedrockagent_knowledge_base" "project_fufel" {
  for_each = tomap({ for idx, user in var.user_ids : idx => user })

  name     = "${each.value}-1"
  role_arn = "arn:aws:iam::992382412567:role/service-role/AmazonBedrockExecutionRoleForKnowledgeBase_0b9sf"

  knowledge_base_configuration {
    vector_knowledge_base_configuration {
      embedding_model_arn = "arn:aws:bedrock:ap-southeast-2::foundation-model/amazon.titan-embed-text-v2:0"
    }
    type = "VECTOR"
  }

  storage_configuration {
    type = "PINECONE"
    pinecone_configuration {
      connection_string      = "https://main-y1af2rh.svc.aped-4627-b74a.pinecone.io"
      credentials_secret_arn = aws_secretsmanager_secret.pinecone_api_key.arn
      namespace              = each.value
      field_mapping {
        metadata_field = "metadata"
        text_field     = "text"
      }
    }
  }

  tags = {
    "UserId" = each.value
  }
}

resource "aws_bedrockagent_data_source" "project_fufel" {
  for_each = aws_bedrockagent_knowledge_base.project_fufel

  knowledge_base_id = each.value.id
  name              = "data-source-s3-1"

  data_source_configuration {
    type = "S3"
    s3_configuration {
      bucket_arn         = aws_s3_bucket.project_fufel_user_info.arn
      inclusion_prefixes = [var.user_ids[tonumber(each.key)]] # Use the user's id as the inclusion prefix
    }
  }
}

resource "aws_dynamodb_table_item" "project_fufel_user_info" {
  for_each = tomap({ for idx, user in var.user_ids : idx => user })

  table_name = aws_dynamodb_table.project_fufel_user_info.name
  hash_key   = aws_dynamodb_table.project_fufel_user_info.hash_key

  item = <<ITEM
{
  "UserId": {"S": "${each.value}"},
  "KnowledgeBaseId": {"S": "${aws_bedrockagent_knowledge_base.project_fufel[each.key].id}"},
  "DataSourceId": {"S": "${aws_bedrockagent_data_source.project_fufel[each.key].data_source_id}"}
}
ITEM

  lifecycle {
    ignore_changes = [item]
  }
}