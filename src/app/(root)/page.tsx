
import ThreadCard from "@/components/cards/threadcard";
import { FetchPosts } from "@/lib/actions/thread.actions";
import { fetchUser } from "@/lib/actions/user.actions";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";



async function Home() {

  const user = await currentUser();
  if (!user) return null;

// const userInfo = await fetchUser(user.id);
// if(!userInfo.onboarded) redirect("/onboarding");

  const result = await FetchPosts(1 ,30);

  return (
      <>
         <h1 className="head-text text-left">Home</h1> 
        

         <section className='mt-9 flex flex-col gap-10'>
        {result.posts.length === 0 ? (
          <p className='no-result'>No threads found</p>
        ) : (
          <>
            {result.posts.map((post) => (
              <ThreadCard
                key={post._id}
                id={post._id}
                currentUserId={user.id}
                parentId={post.parentId}
                content={post.text}
                author={post.author}
                community={post.community}
                createdAt={post.createdAt}
                comments={post.children}
              />
            ))}
          </>
        )}
      </section>
      </>

  );
}




export default Home;






































/* 
Sure, here's a brief explanation of these folders in a Next.js project:

1. `lib` folder: This folder typically contains utility functions, helper classes, or modules used across the application. These utilities might include custom hooks, data manipulation functions, or third-party libraries that are used globally³⁵.

2. `public` folder: The public folder in Next.js is used to serve static files, like images, under a folder called public in the root directory. Files inside public can then be referenced by your code starting from the base URL (`/`). For example, the file `public/avatars/me.png` can be viewed by visiting the `/avatars/me.png` path⁶⁷⁸.

3. `actions` folder: Server actions are asynchronous functions that are executed on the server. They can be used in Server and Client Components to handle form submissions and data mutations in Next.js applications¹⁴¹⁵.

4. `models` folder: While Next.js doesn't have a built-in concept of "models" like some other frameworks, developers often create a `models` folder to organize their data models. These could be classes or functions that represent and manipulate your application's data. However, the organization of such files may vary depending on the specific project requirements¹³.

5. `validations` folder: This folder is typically used to store validation logic for your application. This could include functions that validate form inputs, request payloads, etc. The actual implementation can vary widely depending on your needs and the libraries you're using⁹¹¹¹².

Remember, the structure of a Next.js project can vary based on the needs of the project, and these folders aren't strictly required by Next.js itself. They're often used as a convention to organize code in a way that's easy to understand and maintain. Always refer to your project's documentation or ask your project lead if you're unsure about where certain code should live.

*/