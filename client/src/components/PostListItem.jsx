import { Link } from "react-router-dom";
import Image from "./Image";

const PostListItem = () => {
  return (
    <div className='flex flex-col xl:flex-row gap-8'>
        {/*image*/}
        <div className="md:hidden xl:block xl:w-1/3">
            <Image src="postImg.jpeg" className="rounded-2xl object-cover" w="800"/>
        </div>
        {/*details*/}
        <div className="flex flex-col gap-4 xl:w-2/3">
           <Link to="/test" className="text-4xl font-semibold">
                Lorem ipsum dolor sit amet consectetur adipisicing elit.
           </Link>
           <div className="flex items-center gap-2 text-gray-400 text-sm">
            <span>Written by</span>
            <Link className="text-blue-800">John Doe</Link>
            <span>on</span>
            <Link className="text-blue-800">Web Design</Link>
            <span>2 days ago</span>
           </div>
           <p className="">
                Lorem ipsum dolor, sit amet consectetur adipisicing elit. Sapiente, exercitationem. Rem veniam sapiente quasi laborum eligendi. Neque, totam architecto non, nemo debitis quod assumenda harum fugit corporis, possimus nesciunt fuga!
           </p>
           <Link to="/test" className="underline text-blue-800 text-sm">
                Read More
           </Link>
        </div>
    </div>
  );
};

export default PostListItem