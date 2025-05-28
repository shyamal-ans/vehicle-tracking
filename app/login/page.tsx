// 'use client';
// import React from 'react';
// import { Formik, Form, Field, ErrorMessage } from 'formik';
// import * as Yup from 'yup';
// import { useRouter } from 'next/navigation';

// const LoginSchema = Yup.object().shape({
//   email: Yup.string().email('Invalid email').required('Email is required'),
//   password: Yup.string().required('Password is required'),
// });

// const LoginPage = () => {
//   const router = useRouter();

//   return (
//     <div className="flex items-center justify-center min-h-screen bg-gray-100">
//       <div className="bg-white p-8 rounded shadow-md w-96">
//         <h2 className="text-2xl font-semibold mb-6 text-center text-gray-700">Login</h2>
//         <Formik
//           initialValues={{ email: '', password: '' }}
//           validationSchema={LoginSchema}
//           onSubmit={(values) => {
//             // In a real application, you would handle authentication here
//             console.log('Login submitted:', values);
//             // For this example, let's just redirect to the dashboard
//             router.push('/dashboard');
//           }}
//         >
//           {({ isSubmitting }) => (
//             <Form className="space-y-4">
//               <div>
//                 <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">
//                   Email
//                 </label>
//                 <Field
//                   type="email"
//                   id="email"
//                   name="email"
//                   className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
//                 />
//                 <ErrorMessage name="email" component="div" className="text-red-500 text-sm" />
//               </div>

//               <div>
//                 <label htmlFor="password" className="block text-gray-700 text-sm font-bold mb-2">
//                   Password
//                 </label>
//                 <Field
//                   type="password"
//                   id="password"
//                   name="password"
//                   className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
//                 />
//                 <ErrorMessage name="password" component="div" className="text-red-500 text-sm" />
//               </div>

//               <button
//                 type="submit"
//                 className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
//                 disabled={isSubmitting}
//               >
//                 {isSubmitting ? 'Logging In...' : 'Login'}
//               </button>
//             </Form>
//           )}
//         </Formik>
//       </div>
//     </div>
//   );
// };

// export default LoginPage;

"use client";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/redux/store";
import { loginUser } from "@/slices/loginSlice";
import { FaEnvelope, FaLock } from "react-icons/fa";
import { useRouter } from "next/navigation";

const LoginPage = () => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const initialValues = {
    email: "",
    password: "",
  };

  const validationSchema = Yup.object({
    email: Yup.string().email("Invalid email").required("Email is required"),
    password: Yup.string()
      .min(6, "Minimum 6 characters")
      .required("Password is required"),
  });

  const handleSubmit = async (values: typeof initialValues) => {
    console.log("Login values:", values);
    dispatch(loginUser(values));
    router.push("/");
  };

  return (
    <>
      {/* <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
        <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md">
          <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            <Form className="space-y-4">
              <div>
                <label htmlFor="email" className="block mb-1 font-medium">
                  Email
                </label>
                <Field
                  id="email"
                  name="email"
                  type="email"
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <ErrorMessage
                  name="email"
                  component="div"
                  className="text-red-500 text-sm mt-1"
                />
              </div>

              <div>
                <label htmlFor="password" className="block mb-1 font-medium">
                  Password
                </label>
                <Field
                  id="password"
                  name="password"
                  type="password"
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <ErrorMessage
                  name="password"
                  component="div"
                  className="text-red-500 text-sm mt-1"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition"
              >
                Login
              </button>
            </Form>
          </Formik>
        </div>
      </div> */}
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-700 via-purple-700 to-pink-700 px-4">
        <div className="bg-white/20 backdrop-blur-lg shadow-2xl rounded-2xl p-10 w-full max-w-md text-white">
          <h2 className="text-3xl font-bold text-center mb-6">
            Welcome Back 👋
          </h2>
          <p className="text-center text-sm mb-8 text-white/80">
            Login to your dashboard
          </p>

          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            <Form className="space-y-5">
              <div>
                <div className="relative">
                  <span className="absolute top-1/2 left-3 transform -translate-y-1/2 text-white/70">
                    <FaEnvelope />
                  </span>
                  <Field
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Email"
                    className="w-full pl-10 pr-4 py-2 bg-white/10 rounded-md border border-white/30 focus:outline-none focus:ring-2 focus:ring-white focus:border-white text-white placeholder-white/60"
                  />
                </div>
                <ErrorMessage
                  name="email"
                  component="div"
                  className="text-red-300 text-sm"
                />
              </div>
              <div>
                <div className="relative">
                  <span className="absolute top-1/2 left-3 transform -translate-y-1/2 text-white/70">
                    <FaLock />
                  </span>
                  <Field
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Password"
                    className="w-full pl-10 pr-4 py-2 bg-white/10 rounded-md border border-white/30 focus:outline-none focus:ring-2 focus:ring-white focus:border-white text-white placeholder-white/60"
                  />
                </div>
                <ErrorMessage
                  name="password"
                  component="div"
                  className="text-red-300 text-sm"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-white text-indigo-600 font-semibold py-2 rounded-md hover:bg-indigo-100 transition-all duration-300"
              >
                Login
              </button>
            </Form>
          </Formik>

          {/* <div className="mt-6 text-center text-white/80 text-sm">
            {"Don't have an account?"}{" "}
            <a href="#" className="underline">
              Sign up
            </a>
          </div> */}
        </div>
      </div>
    </>
  );
};

export default LoginPage;
