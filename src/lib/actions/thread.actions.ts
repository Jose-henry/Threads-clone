"use server"

import { connectToDB } from "../mongoose"
import Thread from "../models/thread.model"
import User from "../models/user.model";
import { revalidatePath } from "next/cache";


interface Params {
    text: string,
    author: string,
    communityId: string | null,
    path: string
}



export async function createThread({text, author, communityId, path}: Params) {
    try{
        connectToDB()
    
        const createdThread = await Thread.create({
            text,
            author,
            community: null,
            //createdAt: new Date(),
        });


        // update user model
        await User.findById(author).updateOne({
            $push: {threads: createdThread._id},
        })

        revalidatePath(path); //making sure the changes on a User instance are effected accordingly
    }catch(error: any){
        throw new Error(`Failed to create Thread: ${error.message}`);


    }
    
}


export async function FetchPosts(pageNumber =1, pageSize = 20) { 
    connectToDB();


    //calculate the number of posts to skip
    const skipsAmount = (pageNumber - 1) * pageSize


    //fetch posts that have no parents posts and no comments
    const postQuery = await Thread.find({parentId: { $in: [null, undefined] }}).sort({createdAt: 'desc'}).skip(skipsAmount).limit(pageSize).populate({path: 'author', model: User}).populate({path: 'children', 
    populate: 
    {path: 'author', 
    model: User,
    select: '_id name parentId image'
    }
    });

    const totalPostsCount = await Thread.countDocuments({parentId: { $in: [null, undefined] }});

    const posts = await postQuery;

    const isNext = totalPostsCount > skipsAmount + posts.length;

    return {posts, isNext}

}



export async function fetchThreadById(threadId: string) {
    connectToDB();
  
    try {
      const thread = await Thread.findById(threadId)
        .populate({
          path: "author",
          model: User,
          select: "_id id name image",
        }) // Populate the author field with _id and username
        .populate({
          path: "children", // Populate the children field
          populate: [
            {
              path: "author", // Populate the author field within children
              model: User,
              select: "_id id name parentId image", // Select only _id and username fields of the author
            },
            {
              path: "children", // Populate the children field within children
              model: Thread, // The model of the nested children (assuming it's the same "Thread" model)
              populate: {
                path: "author", // Populate the author field within nested children
                model: User,
                select: "_id id name parentId image", // Select only _id and username fields of the author
              }
            }
          ]
        }).exec();

    return thread;
    } catch (err) {
      console.error("Error while fetching thread:", err);
      throw new Error("Unable to fetch thread");
    }
  }


  export async function addCommentToThread(
    threadId: string,
    commentText: string,
    userId: string,
    path: string
  ) {
    connectToDB();
  
    try {
      // Find the original thread by its ID
      const originalThread = await Thread.findById(threadId);
  
      if (!originalThread) {
        throw new Error("Thread not found");
      }
  
      // Create the new comment thread
      const commentThread = new Thread({
        text: commentText,
        author: userId,
        parentId: threadId, // Set the parentId to the original thread's ID
      });
  
      // Save the comment thread to the database
      const savedCommentThread = await commentThread.save();
  
      // Add the comment thread's ID to the original thread's children array
      originalThread.children.push(savedCommentThread._id);
  
      // Save the updated original thread to the database
      await originalThread.save();
  
      revalidatePath(path);

    } catch (error:any) {
      throw new Error(`Unable to add comment ${error.message}`);
    }
  }