import { Container } from "@mui/material";
import Authenticated from "~/components/HomePage/Authenticated";
import Unauthenticated from "~/components/HomePage/Unauthenticated";
import NavBar from "~/components/Layout/AppBar";
import { getServerAuthSession } from "~/server/auth";

export default async function HomePage() {
  const session = await getServerAuthSession();
  return session ? 
    <div>
      <NavBar />
      {/* 
      // @ts-expect-error https://github.com/mui/material-ui/issues/40370 */}
      <Container maxWidth="s">
        <Authenticated />
      </Container>
    </div>
    : <Unauthenticated />;
}
