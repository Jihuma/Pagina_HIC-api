import { useAuth, useUser } from "@clerk/clerk-react"
import 'react-quill-new/dist/quill.snow.css'
import ReactQuill from 'react-quill-new'
import { useMutation } from "@tanstack/react-query"
import axios from "axios"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "react-toastify"
import { IKContext, IKUpload } from "imagekitio-react"

const authenticator =  async () => {
  try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/posts/upload-auth`);

      if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Request failed with status ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      const { signature, expire, token } = data;
      return { signature, expire, token };
  } catch (error) {
      throw new Error(`Authentication request failed: ${error.message}`);
  }
};

const Write = () => {

  const {isLoaded, isSignedIn} = useUser();
  const [value, setValue] = useState('')

  const navigate = useNavigate()

  const { getToken } = useAuth()

  const mutation = useMutation({
    mutationFn: async (newPost) => {
      const token = await getToken()
      return axios.post(`${import.meta.env.VITE_API_URL}/posts`, newPost, {
        headers: {
          Authorization: `Bearer ${ token}`
        },
      })
    },
    onSuccess:(res)=>{
      toast.success("Post has been created!")
      navigate(`/${res.data.slug}`)
    }
  })

  if(!isLoaded){
    return <div className="">Loading...</div>;
  }

  if(isLoaded && !isSignedIn){
    return <div>You should login</div>
  }

  const handleSubmit = e=>{
    e.preventDefault()

    const formData = new FormData(e.target)

    const data = {
      title: formData.get("title"),
      category: formData.get("category"),
      desc :formData.get("desc"),
      content: value,
    }

    console.log(data)

    mutation.mutate(data)
  }

  return (
    <div className='h-[calc(100vh-64px)] md:h-[calc(100vh-80px)] flex flex-col gap-6 '>
      <h1 className="text-xl font-light">Create a New Post</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-6 flex-1 mb-6">
        {/* <button className="p-2 shadow-md rounded-xl text-sm text-gray-500 bg-white w-max">
          Add a cover image
        </button> */}
        <IKContext 
          publicKey={import.meta.env.VITE_Ik_PUBLIC_KEY} 
          urlEndpoint={import.meta.env.VITE_Ik_URL_ENDPOINT} 
          authenticator={authenticator} 
        >
          <IKUpload
            fileName="test-upload.png"
            // onError={onError}
            // onSuccess={onSuccess}
          />
          </IKContext>
        <input 
          className="text-4xl font-semibold bg-transparent outline-none" 
          type="text" 
          placeholder="My Awesome Story"
          name="title"
        />
        <div className="flex items-center gap-4">
          <label htmlFor="" className="text-sm" >Choose a category</label>
          <select 
            className="p-2 rounded-xl bg-white shadow-md" 
            name="category" 
            id=""
          >
            <option value="general">General</option>
            <option value="web-design">Web Design</option>
            <option value="development">Development</option>
            <option value="databases">Databases</option>
            <option value="seo">Search Engines</option>
            <option value="marketing">Marketing</option>
          </select>
        </div>
        <textarea 
          className="p-4 rounded-xl bg-white shadow-md" 
          name="desc" 
          placeholder="A short decription"
        />
        <div className="flex">
          <div className="flex flex-col gap-2 mr-2">
            <div className="cursor-pointer">😊</div>
            <div className="cursor-pointer">❤️</div>
          </div>
          <ReactQuill 
            theme="snow" 
            className="flex-1 rounded-xl bg-white shadow-md"
            value={value} 
            onChange={setValue}
          />
        </div>
        <button
          disabled={mutation.isPending} 
          className="bg-blue-800 text-white font-medium rounded-xl mt-4 p-2 w-36 disabled:bg-blue-400 disabled:cursor-not-allowed">
            {mutation.isPending ? "Loading..." : "Send"}
          </button>
          {mutation.isError && <span>{mutation.error.message}</span>}
      </form>
    </div>
  )
}

export default Write