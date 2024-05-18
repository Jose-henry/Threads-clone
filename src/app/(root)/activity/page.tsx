import Image from "next/image";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { fetchUser, getActivity } from "@/lib/actions/user.actions";
import Link from "next/link";



const ActivityPage = async () => {

const user = await currentUser();
  if (!user) return null;

  const userInfo = await fetchUser(user.id);
  if (!userInfo?.onboarded) redirect("/onboarding");

  // Get activities
  const activity = await getActivity(userInfo._id);

    return (
        <section>
            <h1 className="head-text mb-10">Activity</h1>

            <section>
                {activity.length > 0 ? (
                    <>
                    {activity.map((activity) => (<Link key={activity._id} href={`/thread/${activity.parentId}`}>
                        <article className="activity-card">
                            <Image
                                src={activity.author.image}
                                alt="Profile image"
                                width={20}
                                height={20}
                                className="rounded-full"
                            />
                            <p className="text-light-1 !text-small-regular">
                                <span className="text-primary-500 mr-1">
                                    {activity.author.name}
                                </span>{" "}
                                replied to your thread
                            </p>
                                                                          </article>
                    </Link>
                    
                ))}
                    </>
                ): <p className="text-light-3 text-base-regular">No activities</p>}
            </section>
        </section>
    )
}

export default ActivityPage