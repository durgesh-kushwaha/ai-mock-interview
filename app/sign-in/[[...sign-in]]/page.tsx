import { SignIn } from "@clerk/nextjs";
import { dark } from '@clerk/themes';

export default function Page() {
  return (
    <div className="flex justify-center items-center h-screen bg-gray-900">
      <SignIn
        appearance={{
          baseTheme: dark,
          variables: { colorPrimary: '#6c47ff' }
        }}
      />
    </div>
  );
}