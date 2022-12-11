import { useRouter } from "next/router"
import axios from "axios"
import { useQueryClient, useMutation } from "@tanstack/react-query"
import { Task } from "@prisma/client"
import useStore from "../store"
import { EditedTask } from "../types"

export const useMutateTask = () => {
  const queryClient = useQueryClient()
  const router = useRouter()

  const reset = useStore((state) => state.resetEditedTask)
  // タスク作成
  const createTaskMutation = useMutation(
    async (task: Omit<EditedTask, 'id'>) => {
      const res = await axios.post(
        `${ process.env.NEXT_PUBLIC_API_URL}/todo`,
        task
      )
      return res.data
    },
    {
      onSuccess: (res) => {
        const previousTodos = queryClient.getQueryData<Task[]>(['tasks']) // キャッシュされている既存のtaskのリストを取得
        if (previousTodos) {
          queryClient.setQueryData(['tasks'], [res, ...previousTodos])
        }
        reset()
      },
      onError: (err: any) => {
        reset()
        if (err.response.status === 401 || err.response.status === 403) {
          router.push('/')
        }
      },
    }
  )
  // タスク更新
  const updateTaskMutation = useMutation(async (task: EditedTask) => 
  {
    const res = await axios.patch(
      `${ process.env.NEXT_PUBLIC_API_URL}/todo/${task.id}`,
      task
    )
    return res.data
  }, 
  {
    onSuccess: (res, variables) => {
      const previousTodos = queryClient.getQueryData<Task[]>(['tasks'])
      if (previousTodos) {
        queryClient.setQueryData(
          ['tasks'],
          previousTodos.map((task) => task.id === res.id ? res : task)
        )
      }
      reset()
    },
    onError: (err: any) => {
      reset()
      if (err.response.status === 401 || err.response.status === 403) {
        router.push('/')
      }
    },
  })
  // タスク削除
  const deleteTaskMutation = useMutation(async (id: number) => {
    await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/todo/${id}`)
  },{
    onSuccess: (_, variables) => {
      const previousTodos = queryClient.getQueryData<Task[]>(['tasks'])
      if (previousTodos) {
        queryClient.setQueryData (
          ['tasks'],
          previousTodos.filter((task) => {
            console.log(task.id)
            console.log(variables)
            return task.id !== variables
          })   // vriablesには削除したタスクのidが入っている
        )
      }
      reset()
    },
    onError: (err: any) => {
      reset()
      if (err.response.status === 401 || err.response.status === 403) {
        router.push('/')
      }
    },
  })
  return { createTaskMutation, updateTaskMutation, deleteTaskMutation }
}
