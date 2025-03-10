import Post from "./Post";
import PostSkeleton from "../skeletons/PostSkeleton";
// import { POSTS } from "../../utils/db/dummy";
import { baseURL } from "../../constant/url";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

const Posts = ({feedType, username, userId}) => {
	const getPostEndPoint = ()=>{
		switch(feedType){
			case "forYou" :
				return `${baseURL}/api/posts/all`;
			case "following" :
				return `${baseURL}/api/posts/following`;
			case "posts" :
				return `${baseURL}/api/posts/user/${username}`;
			case "likes" :
				return `${baseURL}/api/posts/likes/${userId}`;
			default : 
				return `${baseURL}/api/posts/all`;
		}
	}

	const POST_END_POINT = getPostEndPoint();

	const {data : posts, isLoading, refetch, isRefetching} = useQuery({
		queryKey : ["posts"],
		queryFn : async ()=>{
			try{
				const res = await fetch(POST_END_POINT,{
					method : "GET",
					credentials : "include",
					headers : {
						"Content-Type" : "application/json"
					}
				});

				const data = await res.json();
				
				if(!res.ok){
					throw new Error(data.error || "Something Went Wrong!")
				}
				return data;
			}catch(error){
				throw new Error(error)
			}
		}
	})

	useEffect(()=>{
		refetch()
	},[feedType, refetch, username])

	return (
		<>
			{(isLoading || isRefetching) && (
				<div className='flex flex-col justify-center'>
					<PostSkeleton />
					<PostSkeleton />
					<PostSkeleton />
				</div>
			)}
			{!isLoading && posts?.length === 0 && <p className='text-center my-4'>No posts in this tab. Switch 👻</p>}
			{!isLoading && posts && (
				<div>
					{posts.map((post) => (
						<Post key={post._id} post={post} />
					))}
				</div>
			)}
		</>
	);
};
export default Posts;