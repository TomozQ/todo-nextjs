import { useRouter } from "next/router"
import axios from "axios"
import { useQuery } from "@tanstack/react-query"
import { User } from "@prisma/client"

export const useQueryUser = () => {
  const router = useRouter()
  
  const getUser = async () => {
    const { data } = await axios.get<Omit<User, 'hashedPassword'>>(
      `${ process.env.NEXT_PUBLIC_API_URL }/user`
    )
    return data
  }
  return useQuery<Omit<User, 'hashedPassword'>, Error>({
    queryKey: ['user'],
    queryFn: getUser,
    onError: (err: any) => {
      // 401 -> jwtトークンが無効な場合、期限が切れている場合、 403 -> csrfトークンが無効な場合
      if (err.response.status === 401 || err.response.status === 403) router.push('/')
    },
  })
}
