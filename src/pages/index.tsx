
import Navbar from "../components/Navbar";

export default function Home() {

  return (
      <div className="max-w-[720px] mx-auto flex flex-col border-b-[1px] border-b-gray-800">
        <div className='flex flex-col items-center gap-8 mt-4 mb-8'>
          <p>Digite o repositório!</p>
          <Navbar />
        </div>
      </div>
  )
}


