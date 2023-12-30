import LoginButton from "./LoginButton";

export default async function Unauthenticated() {
  return (
    <div className="relative">
			<div className="absolute top-0 right-0 pt-4 pr-4">
      	<LoginButton />
			</div>
      <div className="flex h-screen flex-col items-center justify-center gap-3">
        <h1 className="text-6xl">Hey!</h1>
        <p className="text-2xl">
          You just stomped on the frontend of sern Automata.
        </p>
        <p className="text-2xl">
          It's unfortunately WIP and for security purposes it's behind a login
          wall that only the devteam can access.
        </p>
        <p className="text-3xl">Sorry!</p>
      </div>
    </div>
  );
}
