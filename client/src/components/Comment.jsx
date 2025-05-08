import Image from "./Image"
const Comment = () => {
  return (
    <div className='p-4 bg-slate-50 rounded-xl mb-4'>
        <div className="flex items-center gap-4">
            <Image src="userImg.jpeg" className="w-10 h-10 rounded-full" w="40"/>
            <span className="font-medium">John Doe</span>
            <span className="text-sm text-gray-500">2 days ago</span>
        </div>
        <div className="mt-4">
            <p>Lorem ipsum dolor sit, amet consectetur adipisicing elit. Ducimus nam rerum velit totam numquam at blanditiis, quia quaerat aperiam aut nemo sunt enim officiis voluptas, eveniet debitis eos quibusdam incidunt.</p>
        </div>
    </div>
  );
};

export default Comment