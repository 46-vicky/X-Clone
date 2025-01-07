import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { baseURL } from "../constant/url";

const useUpdateUserProfile = () => {
    const queryClient = useQueryClient()
    const {mutateAsync : updateProfile, isPending : isUpdatingProfile} = useMutation({
		mutationFn : async(formData)=>{
			try{
				const res = await fetch(`${baseURL}/api/users/update`,{
					method : "POST",
					credentials : "include",
					headers : {
						"Content-Type" : "application/json"
					},
					body : JSON.stringify(formData)
				})

				const data = await res.json()

				if(!res.ok){
					throw new Error(data.error || "Something Went Wrong")
				}
				return data;
			}catch(error){
				throw new Error(error)
			}
		},
		onSuccess : ()=>{
			toast.success("Profile Updated")
			Promise.all([
				queryClient.invalidateQueries({queryKey : ["authUser"]}),
				queryClient.invalidateQueries({queryKey : ["userProfile"]}),
			])
		},
		onError : (error)=>{
			toast.error(error.message)
		}
	})
    return{updateProfile, isUpdatingProfile}
}

export default useUpdateUserProfile