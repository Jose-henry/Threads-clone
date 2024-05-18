"use server"

import { revalidatePath } from "next/cache";
import User from "../models/user.model";
import { connectToDB } from "../mongoose"
import Community from "../models/community.model";
import Thread from "../models/thread.model";
import { FilterQuery, SortOrder } from "mongoose";
import { use } from "react";



export async function fetchUser(userId: string) {
    try {
      connectToDB();
  
      return await User.findOne({ id: userId }).populate({
        path: "communities",
        model: Community,
      });
    } catch (error: any) {
      throw new Error(`Failed to fetch user: ${error.message}`);
    }
  }




interface Params {
    userId: string;
    username: string;
    name: string;
    bio: string;
    image: string;
    path: string;
}

export async function updateUser({
    userId,
    username, 
    name,
    bio,
    image,
    path,
}: Params): Promise<void> {
    connectToDB();
    try {
        await User.findOneAndUpdate({ id: userId }, { username: username.toLowerCase(),
            name: name, 
            bio: bio, 
            image: image,
            onboarded: true,
             },
             {upsert: true}
            );
            if(path === '/profile/edit'){
                revalidatePath(path);
            } 
        }catch (error: any) {
        throw new Error(`Failed to create/update user: ${error.message}`);
    }
   

}



export async function fetchUserPosts(userId:string) {
  try {
    connectToDB();
    const threads = await User.findOne({ id: userId }).populate({
      path: "threads",
      model: Thread,
      populate: { 
        path: "children",
        model: Thread,
        populate: { path: "author", model: User, select: "id name image" } 

      },
    })
    return threads
   
  } catch (error: any) {
    throw new Error(`Failed to fetch user: ${error.message}`);
  }
  
}

export async function fetchUsers({
  userId,
  pageNumber = 1,
  pageSize = 20,
  searchString = "",
  sortBy = "desc",
}:{
  userId?: string;
  pageNumber?: number;
  pageSize?: number;
  searchString?: string;
  sortBy?: SortOrder;
}) {
  try {
    connectToDB();
    const skipAmount = (pageNumber - 1) * pageSize
    const regex = new RegExp(searchString, "i");

    const query: FilterQuery<typeof User> = {
      id: { $ne: userId },
    }

    if(searchString.trim() !== ""){
      query["$or"] = [
        { username: { $regex: regex } },
        { name: { $regex: regex } },
      ]
    }


    const sortOptions = {
      createdAt: sortBy
    }

    const usersQuery = User.find(query).sort(sortOptions).skip(skipAmount).limit(pageSize)

    const totalUsersCount = await User.countDocuments(query)

    const users = await usersQuery.exec()

    const isNext = totalUsersCount > skipAmount + users.length

    return { users, isNext }


  } catch (error: any) {
    throw new Error(`Failed to fetch users: ${error.message}`);
  }
}


export async function getActivity(userId:string) {
  try {
    connectToDB();

    // find all threads created by the user
    const userThreads = await Thread.find({ author: userId });

    // find all child thread ids (replies/comments) from the children field
    const childThreadIds = userThreads.reduce((acc, userThread) => {
      return acc.concat(userThread.children);
    }, []);

    const replies = await Thread.find({ 
      _id: { $in: childThreadIds },
      author: { $ne: userId } 
    
    }).populate({ path: "author", model: User, select: "id name image" });

    return replies
  } catch (error: any) {
    throw new Error(`Failed to fetch activity: ${error.message}`);
  }
}