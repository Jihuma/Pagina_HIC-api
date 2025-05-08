import Image from "../components/Image"
import { Link } from "react-router-dom"
import PostMenuActions from "../components/PostMenuActions"
import Search from "../components/Search"
import Comments from "../components/Comments"
const SinglePostPage = () => {
  return (
    <div className='flex flex-col gap-8'>
      {/*detail*/}
      <div className="flex gap-8">
        <div className="lg:w-3/5 flex flex-col gap-8">
          <h1 className="text-xl md:text-3xl xl:text-4xl 2xl:text-5xl font-semibold">
            Lorem ipsum dolor sit amet, consectetur adipisicing elit. Odit, accusantium amet?
          </h1>
          <div className="flex items-center gap-2 text-gray-400 text-sm">
            <span>Written by</span>
            <Link className="text-blue-800">John Doe</Link>
            <span>on</span>
            <Link className="text-blue-800">Web Design</Link>
            <span>2 days ago</span>
          </div>

          <p className="text-gray-500 font-medium">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Consectetur qui mollitia ipsam incidunt totam quidem error tempora, eos aperiam vitae quae libero molestias minus. Eligendi esse provident tempore. Deserunt, necessitatibus.
          </p>

        </div>

        <div className="hidden lg:block w-2/5">
          <Image src="postImg.jpeg" w="600" className="rounded-2xl"/>
        </div>
      </div>
      {/*content*/}
      <div className="flex flex-col md:flex-row gap-12">
        {/*text*/}
        <div className="lg:text-lg flex flex-col gap-6 text-justify">
          <p>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Atque quia molestias numquam quos accusantium voluptas quaerat consequatur optio itaque assumenda quam cumque impedit, officia amet, voluptatem repudiandae harum sequi similique!
          </p>
          <p>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Atque quia molestias numquam quos accusantium voluptas quaerat consequatur optio itaque assumenda quam cumque impedit, officia amet, voluptatem repudiandae harum sequi similique!
          </p>
          <p>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Atque quia molestias numquam quos accusantium voluptas quaerat consequatur optio itaque assumenda quam cumque impedit, officia amet, voluptatem repudiandae harum sequi similique!
          </p>
          <p>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Atque quia molestias numquam quos accusantium voluptas quaerat consequatur optio itaque assumenda quam cumque impedit, officia amet, voluptatem repudiandae harum sequi similique!
          </p>
          <p>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Atque quia molestias numquam quos accusantium voluptas quaerat consequatur optio itaque assumenda quam cumque impedit, officia amet, voluptatem repudiandae harum sequi similique!
          </p>
          <p>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Atque quia molestias numquam quos accusantium voluptas quaerat consequatur optio itaque assumenda quam cumque impedit, officia amet, voluptatem repudiandae harum sequi similique!
          </p>
          <p>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Atque quia molestias numquam quos accusantium voluptas quaerat consequatur optio itaque assumenda quam cumque impedit, officia amet, voluptatem repudiandae harum sequi similique!
          </p>
          <p>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Atque quia molestias numquam quos accusantium voluptas quaerat consequatur optio itaque assumenda quam cumque impedit, officia amet, voluptatem repudiandae harum sequi similique!
          </p>
          <p>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Atque quia molestias numquam quos accusantium voluptas quaerat consequatur optio itaque assumenda quam cumque impedit, officia amet, voluptatem repudiandae harum sequi similique!
          </p>
          <p>
            Lorem ipsum dolor, sit amet consectetur adipisicing elit. Veritatis commodi dicta ab ea debitis aspernatur! Quam porro, fugit quos, fugiat accusantium ex laudantium eius aliquid libero repellendus repudiandae odit ducimus.
          </p>
          <p>
            Lorem ipsum, dolor sit amet consectetur adipisicing elit. Veniam, asperiores quisquam iusto error praesentium neque, ad facilis ipsum obcaecati totam, delectus enim autem natus in necessitatibus laboriosam! Corrupti, voluptatibus dignissimos.
          </p>
        </div>

        {/*menu*/}
        <div className="px-4 h-max sticky top-8">
          <h1 className="mb-4 text-sm font-medium">Author</h1>
          <div className="flex flex-col gap-4">
          <div className="flex items-center gap-8">
            <Image 
              src="userImg.jpeg" 
              className="w-12 h-12 rounded-full object-cover" 
              w="48" 
              h="48"
            />
            <Link className="text-blue-800">John Doe</Link>
            </div>
            <p className="text-sm text-gray-500">Lorem ipsum, dolor sit amet consectetur adipisicing elit.</p>
            <div className="flex gap-2">
              <Link>
                <Image src="facebook.svg"/>
              </Link>
              <Link>
                <Image src="instagram.svg"/>
              </Link>
            </div>
          </div>
          
          <PostMenuActions/>
          <h1 className="mt-8 mb-4 text-sm font-medium">Categories</h1>
          <div className="flex flex-col gap-2 text-sm">
            <Link className="underline">All</Link>
            <Link className="underline" t="/">
              Web Design 
            </Link>
            <Link className="underline" t="/">
              Development 
            </Link>
            <Link className="underline" t="/">
              Databases
            </Link>
            <Link className="underline" t="/">
              Search Engines 
            </Link>
            <Link className="underline" t="/">
              Marketing 
            </Link>
          </div>
          <h1 className="mt-8 mb-4 text-sm font-medium">Search</h1>
          <Search/>
        </div>
      </div>
      <Comments/>
    </div>
  )
}

export default SinglePostPage