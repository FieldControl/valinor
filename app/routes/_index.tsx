import { redirect, V2_MetaFunction } from "@remix-run/node";
import type { LoaderArgs } from "@remix-run/node"

export const meta: V2_MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export async function loader({ request }: LoaderArgs) {
  return redirect('/films/1')
}