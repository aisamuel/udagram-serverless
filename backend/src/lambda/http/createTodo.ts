import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import * as uuid from 'uuid'

import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import { getUserId } from '../utils';
import { createTodo } from '../../businessLogic/todos'

const bucketName = process.env.ATTACHMENT_S3_BUCKET

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const parsedBody: CreateTodoRequest = JSON.parse(event.body)
    
    // TODO: Implement creating a new TODO item
    const todoId = uuid.v4()
    const createdAt = Date.now().toString()
  
    const payload = {
      todoId: todoId,
      userId: getUserId(event),
      done: false,
      createdAt: createdAt,
      attachmentUrl: `https://${bucketName}.s3.amazonaws.com/${todoId}`,
      ...parsedBody
    }

    const newItem = await createTodo(payload)

    return {
      statusCode: 201,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({
        newItem
      })
    }
})

handler.use(
  cors({
    credentials: true
  })
)
