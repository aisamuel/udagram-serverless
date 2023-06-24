import 'source-map-support/register'
import * as AWS  from 'aws-sdk'
import { CreateTodoPayload } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
// import * as AWSXRay from 'aws-xray-sdk'

const docClient = new AWS.DynamoDB.DocumentClient()
const s3 = new AWS.S3({
  signatureVersion: 'v4'
})

const todosTable = process.env.TODOS_TABLE
const bucketName = process.env.ATTACHMENT_S3_BUCKET
const urlExpiration = process.env.SIGNED_URL_EXPIRATION
const todosCreatedAtIndex = process.env.TODOS_CREATED_AT_INDEX

export async function getTodosForUser(userId: string) {
  try {
    const result = await docClient.query({
      TableName: todosTable,
      IndexName : todosCreatedAtIndex,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId
      },
      ScanIndexForward: false
    }).promise()

    return result.Items

  }
  catch (err) {
      console.error(`Get Todo:`, err);
      return {"error":err}
    }

}


export async function createTodo(newItem: CreateTodoPayload) {
  try {
    await docClient.put({
      TableName: todosTable,
      Item: newItem
    }).promise()

    return newItem
  }
  catch (err) {
    console.error(`Creating Todo:`, err);
    return {"error":err}
  }
}


export async function updateTodo(todoId: string, userId: string, updatedItem: UpdateTodoRequest) {
  
  try {
    await docClient.update({
      TableName: todosTable,
      Key: {
        "todoId": todoId,
        "userId": userId
      },
      ExpressionAttributeNames: {"#N": "name"},
      UpdateExpression: "set #N = :name, dueDate = :dueDate, done = :done",
      ExpressionAttributeValues: {
        ":name": updatedItem.name,
        ":dueDate": updatedItem.dueDate,
        ":done": updatedItem.done
      },
    }).promise()

    return updatedItem
  }
  catch (err) {
    console.error(`Updating Todo:${todoId}`, err);
    return {"error":err}
  }
}

export async function deleteTodo(todoId: string, userId: string) {
  
  try {
    return await docClient.delete({
      TableName: todosTable,
      Key: {
        "todoId": todoId,
        "userId": userId
      }
    }).promise()

  }
  catch (err) {
    console.error(`Deleting Todo:${todoId}`, err);
    return {"error":err}
  }
}

export async function todoExists(todoId: string, userId: string) {
  const result = await docClient
    .get({
      TableName: todosTable,
      Key: {
        todoId: todoId,
        userId: userId
      }
    })
    .promise()

  console.log('Get todo: ', result)
  return !!result.Item
}

export function createAttachmentPresignedUrl(todoId: string) {
  return s3.getSignedUrl('putObject', {
    Bucket: bucketName,
    Key: todoId,
    Expires: +urlExpiration
  })
}