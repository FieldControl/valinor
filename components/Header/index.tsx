import {
  ChangeEventHandler,
  InputHTMLAttributes,
  MouseEventHandler
} from "react";
interface HeaderProps extends InputHTMLAttributes<T> {
  onChange?: ChangeEventHandler | undefined;
  onSubmit?: MouseEventHandler | undefined;
}

interface inputProps{
  function: ()=> {}
}
function submited(event:any){
  event.preventDefault()
}
export function Header({ onChange, onSubmit, ...rest }: HeaderProps) {
  return (
    <header className=" fixed top-0 flex items-center bg-backGround-header text-center w-full h-fit p-4 container-xl d-flex flex-column flex-lg-row flex-items-center p-responsive height-full position-relative justify-center">
      <form id="search-form" onSubmit={submited} className="flex w-full justify-center">
        <input
          {...rest}
          form="search-form"
          onChange={onChange}
          type="text"
          aria-label="Search field"
          name="search"
          id="search"
          placeholder="Search for..."
          className=" focus-within:border-link pl-4 h-8 mx-8 w-full max-w-md bg-backGround-body border-solid border-2 border-border outline-none rounded-md"
        />
        <button
          form="search-form"
          type="submit"
          onClick={onSubmit}
          aria-label="Send Button"
          className="bg-link items-center rounded-md px-6 py-1 font-bold text-center hover:opacity-40 focus:border-solid focus:border-white focus:border  "
        >
          Send
        </button>
      </form>
    </header>
  );
}
