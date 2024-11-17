resource "aws_bedrockagent_knowledge_base" "this" {
  name     = "igor-test-543453"
  role_arn = aws_iam_role.bedrock.arn
  knowledge_base_configuration {
    vector_knowledge_base_configuration {
      embedding_model_arn = "arn:aws:bedrock:ap-southeast-2::foundation-model/amazon.titan-embed-text-v2:0"
    }
    type = "VECTOR"
  }
  storage_configuration {
    type = "OPENSEARCH_SERVERLESS"
    opensearch_serverless_configuration {
      collection_arn    = aws_opensearchserverless_collection.this.arn
      vector_index_name = "bedrock-knowledge-base-default-index"
      field_mapping {
        vector_field   = "bedrock-knowledge-base-default-vector"
        text_field     = "AMAZON_BEDROCK_TEXT_CHUNK"
        metadata_field = "AMAZON_BEDROCK_METADATA"
      }
    }
  }
  depends_on = [
    opensearch_index.this,
    # aws_iam_role_policy.bedrock_kb_forex_kb_model,
    # aws_iam_role_policy.bedrock_kb_forex_kb_s3,
    # time_sleep.aws_iam_role_policy_bedrock_kb_forex_kb_oss
  ]
}

resource "aws_bedrockagent_data_source" "this" {
  knowledge_base_id = aws_bedrockagent_knowledge_base.this.id
  name              = "igor-test-43789"
  data_source_configuration {
    type = "S3"
    s3_configuration {
      bucket_arn = "arn:aws:s3:::igor-test-bedrock"
    }
  }
}


resource "aws_opensearchserverless_collection" "this" {
  name = "wiyf8pm1zgsf2rnd96of"
  type = "VECTORSEARCH"

  depends_on = [aws_opensearchserverless_security_policy.this, aws_opensearchserverless_access_policy.this, aws_opensearchserverless_security_policy.this_sec]

}

resource "aws_opensearchserverless_access_policy" "this" {
  name = "wiyf8pm1zgsf2rnd96of"
  type = "data"
  policy = jsonencode([
    {
      Rules = [
        {
          ResourceType = "index"
          Resource = [
            "index/${"wiyf8pm1zgsf2rnd96of"}/*"
          ]
          Permission = [
            "aoss:CreateIndex",
            "aoss:DeleteIndex", # Required for Terraform
            "aoss:DescribeIndex",
            "aoss:ReadDocument",
            "aoss:UpdateIndex",
            "aoss:WriteDocument"
          ]
        },
        {
          ResourceType = "collection"
          Resource = [
            "collection/${"wiyf8pm1zgsf2rnd96of"}"
          ]
          Permission = [
            "aoss:CreateCollectionItems",
            "aoss:DescribeCollectionItems",
            "aoss:UpdateCollectionItems"
          ]
        }
      ],
      Principal = [
        "arn:aws:iam::665628331607:role/service-role/AmazonBedrockExecutionRoleForKnowledgeBase_8esg8",
        data.aws_caller_identity.this.arn
      ]
    }
  ])
}


resource "aws_opensearchserverless_security_policy" "this" {
  name = "wiyf8pm1zgsf2rnd96of"
  type = "encryption"
  policy = jsonencode({
    Rules = [
      {
        Resource = [
          "collection/${"wiyf8pm1zgsf2rnd96of"}"
        ]
        ResourceType = "collection"
      }
    ],
    AWSOwnedKey = true
  })
}

resource "aws_opensearchserverless_security_policy" "this_sec" {
  name = "wiyf8pm1zgsf2rnd96of"
  type = "network"
  policy = jsonencode([
    {
      Rules = [
        {
          ResourceType = "collection"
          Resource = [
            "collection/${"wiyf8pm1zgsf2rnd96of"}"
          ]
        },
        {
          ResourceType = "dashboard"
          Resource = [
            "collection/${"wiyf8pm1zgsf2rnd96of"}"
          ]
        }
      ]
      AllowFromPublic = true
    }
  ])
}

resource "opensearch_index" "this" {
  name                           = "bedrock-knowledge-base-default-index"
  number_of_shards               = "2"
  number_of_replicas             = "0"
  index_knn                      = true
  # index_knn_algo_param_ef_search = "512"
  mappings                       = <<-EOF
    {
      "properties": {
        "bedrock-knowledge-base-default-vector": {
          "type": "knn_vector",
          "dimension": 1024,
          "method": {
            "name": "hnsw",
            "engine": "faiss",
            "parameters": {
              "m": 16,
              "ef_construction": 512
            },
            "space_type": "l2"
          }
        },
        "AMAZON_BEDROCK_METADATA": {
          "type": "text",
          "index": "false"
        },
        "AMAZON_BEDROCK_TEXT_CHUNK": {
          "type": "text",
          "index": "true"
        }
      }
    }
  EOF
  force_destroy                  = true
  depends_on                     = [aws_opensearchserverless_collection.this]
}

provider "opensearch" {
  url         = aws_opensearchserverless_collection.this.collection_endpoint
  healthcheck = false
}
