import { redirect } from "next/navigation";

/** Was a template homepage built from demo sections. The real homepage is "/". */
export default function DemoHome2Redirect() {
  redirect("/");
}
