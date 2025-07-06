
export const loginPage = (pageContainer: HTMLElement) => {
    pageContainer.innerHTML = `
    <main class="bg-background-color text-foreground-color" style="font-family: 'Inter', sans-serif;">
        <div class="flex min-h-screen">
            <div class="flex flex-1 flex-col justify-center py-12 px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
                <div class="mx-auto w-full max-w-sm lg:w-96">
                    <div>
                        <div class="flex items-center gap-2 mb-8">
                            <div class="w-8 h-8 text-primary-color">
                                <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M6 6H42L36 24L42 42H6L12 24L6 6Z" fill="currentColor"></path>
                                </svg>
                            </div>
                            <h2 class="text-2xl font-bold tracking-tight text-foreground-color">ConnectHub</h2>
                        </div>
                        <h2 class="mt-6 text-3xl font-bold tracking-tight text-foreground-color">Get started</h2>
                        <p class="mt-2 text-sm text-gray-600">
                            Choose your preferred method to continue.
                        </p>
                    </div>
                    <div class="mt-8">
                        <div class="mt-6">
                            <div class="flex gap-4 mb-6">
                                <button
                                    class="flex-1 py-3 px-4 justify-center items-center gap-2 rounded-md bg-primary-color text-white text-sm font-semibold shadow-sm hover:bg-opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-color"
                                    id="show-signin-btn">
                                    Sign In
                                </button>
                                <button
                                    class="flex-1 py-3 px-4 justify-center items-center gap-2 rounded-md bg-subtle-background text-foreground-color text-sm font-semibold shadow-sm hover:bg-gray-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-color"
                                    id="show-signup-btn">
                                    Sign Up
                                </button>
                            </div>
                            <button
                                class="w-full inline-flex justify-center py-3 px-4 items-center gap-x-2 text-sm font-semibold rounded-md border border-subtle-border bg-white text-gray-800 shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none">
                                <svg class="w-5 h-auto" fill="none" height="47" viewBox="0 0 46 47" width="46">
                                    <path
                                        d="M46 24.219C46 22.619 45.859 21.099 45.549 19.649H23.469V28.249H36.449C35.919 31.339 34.369 33.899 32.099 35.549L31.999 35.639L39.219 41.289L39.639 41.329C43.519 37.839 46 31.559 46 24.219Z"
                                        fill="#4285F4"></path>
                                    <path
                                        d="M23.469 47C29.539 47 34.729 44.919 38.639 41.329L31.999 35.639C29.989 37.019 26.999 37.899 23.469 37.899C17.279 37.899 12.019 33.729 10.159 28.389L9.999 28.409L2.619 33.979L2.529 34.109C6.349 41.879 14.279 47 23.469 47Z"
                                        fill="#34A853"></path>
                                    <path
                                        d="M10.159 28.389C9.719 27.019 9.469 25.569 9.469 24.049C9.469 22.529 9.719 21.079 10.149 19.709L10.109 19.579L2.819 14.089L2.529 13.989C0.919 17.079 0 20.429 0 24.049C0 27.669 0.919 31.019 2.529 34.109L10.159 28.389Z"
                                        fill="#FBBC05"></path>
                                    <path
                                        d="M23.469 9.199C26.419 9.199 29.069 10.189 31.259 12.239L38.789 4.889C34.719 1.349 29.539 0 23.469 0C14.279 0 6.349 5.129 2.529 12.899L10.149 18.689C12.019 13.269 17.279 9.199 23.469 9.199Z"
                                        fill="#EA4335"></path>
                                </svg>
                                Continue with Google
                            </button>
                        </div>
                        <div class="mt-8 space-y-6 form-container opacity-0 max-h-0 overflow-hidden" id="signin-form">
                            <div>
                                <label class="block text-sm font-medium leading-6 text-foreground-color"
                                    for="signin-username">Username</label>
                                <div class="mt-2">
                                    <input
                                        class="block w-full rounded-md border-0 py-2.5 px-3 text-foreground-color shadow-sm ring-1 ring-inset ring-subtle-border placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-color sm:text-sm sm:leading-6"
                                        id="signin-username" name="username" placeholder="Enter your username" required=""
                                        type="text" />
                                </div>
                            </div>
                            <div>
                                <label class="block text-sm font-medium leading-6 text-foreground-color"
                                    for="signin-password">Password</label>
                                <div class="mt-2">
                                    <input
                                        class="block w-full rounded-md border-0 py-2.5 px-3 text-foreground-color shadow-sm ring-1 ring-inset ring-subtle-border placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-color sm:text-sm sm:leading-6"
                                        id="signin-password" name="password" placeholder="Enter your password" required=""
                                        type="password" />
                                </div>
                            </div>
                            <div>
                                <button
                                    class="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-color hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-color"
                                    type="submit">
                                    Sign In
                                </button>
                            </div>
                        </div>
                        <div class="mt-8 space-y-6 form-container opacity-0 max-h-0 overflow-hidden" id="signup-form">
                            <div>
                                <label class="block text-sm font-medium leading-6 text-foreground-color"
                                    for="signup-username">Username</label>
                                <div class="mt-2">
                                    <input
                                        class="block w-full rounded-md border-0 py-2.5 px-3 text-foreground-color shadow-sm ring-1 ring-inset ring-subtle-border placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-color sm:text-sm sm:leading-6"
                                        id="signup-username" name="username" placeholder="Choose a username" required=""
                                        type="text" />
                                </div>
                            </div>
                            <div>
                                <label class="block text-sm font-medium leading-6 text-foreground-color"
                                    for="signup-password">Password</label>
                                <div class="mt-2">
                                    <input
                                        class="block w-full rounded-md border-0 py-2.5 px-3 text-foreground-color shadow-sm ring-1 ring-inset ring-subtle-border placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-color sm:text-sm sm:leading-6"
                                        id="signup-password" name="password" placeholder="Create a password" required=""
                                        type="password" />
                                </div>
                            </div>
                            <div>
                                <label class="block text-sm font-medium leading-6 text-foreground-color"
                                    for="confirm-password">Confirm Password</label>
                                <div class="mt-2">
                                    <input
                                        class="block w-full rounded-md border-0 py-2.5 px-3 text-foreground-color shadow-sm ring-1 ring-inset ring-subtle-border placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-color sm:text-sm sm:leading-6"
                                        id="confirm-password" name="confirm-password" placeholder="Confirm your password"
                                        required="" type="password" />
                                </div>
                            </div>
                            <div>
                                <label class="block text-sm font-medium leading-6 text-foreground-color" for="email">Email
                                    address</label>
                                <div class="mt-2">
                                    <input autocomplete="email"
                                        class="block w-full rounded-md border-0 py-2.5 px-3 text-foreground-color shadow-sm ring-1 ring-inset ring-subtle-border placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-color sm:text-sm sm:leading-6"
                                        id="email" name="email" placeholder="Enter your email" required="" type="email" />
                                </div>
                            </div>
                            <div>
                                <label class="block text-sm font-medium leading-6 text-foreground-color"
                                    for="full-name">Full Name</label>
                                <div class="mt-2">
                                    <input
                                        class="block w-full rounded-md border-0 py-2.5 px-3 text-foreground-color shadow-sm ring-1 ring-inset ring-subtle-border placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-color sm:text-sm sm:leading-6"
                                        id="full-name" name="full-name" placeholder="Enter your full name" required=""
                                        type="text" />
                                </div>
                            </div>
                            <div>
                                <label class="block text-sm font-medium leading-6 text-foreground-color" for="avatar">Avatar
                                    Image</label>
                                <div class="mt-2 flex items-center gap-x-3">
                                    <svg aria-hidden="true" class="h-12 w-12 text-gray-300" fill="currentColor"
                                        viewBox="0 0 24 24">
                                        <path clip-rule="evenodd"
                                            d="M18.685 19.097A9.723 9.723 0 0021.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 003.065 7.097A9.716 9.716 0 0012 21.75a9.716 9.716 0 006.685-2.653zm-12.54-1.285A7.486 7.486 0 0112 15a7.486 7.486 0 015.855 2.812A8.224 8.224 0 0112 20.25a8.224 8.224 0 01-5.855-2.438zM15.75 9a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"
                                            fill-rule="evenodd"></path>
                                    </svg>
                                    <input class="hidden" id="avatar" name="avatar" type="file" />
                                    <label
                                        class="cursor-pointer rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-foreground-color shadow-sm ring-1 ring-inset ring-subtle-border hover:bg-gray-50"
                                        for="avatar">Upload Avatar</label>
                                </div>
                            </div>
                            <div class="flex items-center">
                                <input class="h-4 w-4 rounded border-gray-300 text-primary-color focus:ring-primary-color"
                                    id="enable-2fa" name="enable-2fa" type="checkbox" />
                                <label class="ml-2 block text-sm text-foreground-color" for="enable-2fa">Enable 2FA</label>
                            </div>
                            <div>
                                <button
                                    class="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-color hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-color"
                                    type="submit">
                                    Sign Up
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="relative hidden w-0 flex-1 lg:block">
                <img alt="A person using a laptop with code on the screen."
                    class="absolute inset-0 h-full w-full object-cover"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAfUdM6KcofVf2FuLajywm4NlU8zC_cdpoJWfVOltPDwX581xky7mO1ivyENc1WG74TsaSZ3ZvCQjcnBvQm6SNHFFilm5RySk_QAaFz53INDoXRzSOwVK4WX6VysMJlSbuwImngyk9bD1m0npTRv3X1CjDPdbx1lat1IizQvMe-Dfp2C2TnZOSWfRS6vy7xeIwjLlZ0Y3p1jrPRhFFJ6bFhr4qAhc7pcJOTAesDXEEK1wLBWISgJkbyIcfEy_NgagML2hnQgqV3D6k" />
                <div class="absolute inset-0 bg-gray-800 mix-blend-multiply"></div>
            </div>
        </div>
    </main>
    `

    const showSignInBtn = document.getElementById('show-signin-btn');
    const showSignUpBtn = document.getElementById('show-signup-btn');
    const signInForm = document.getElementById('signin-form');
    const signUpForm = document.getElementById('signup-form');

    if (!showSignInBtn || !showSignUpBtn || !signInForm || !signUpForm) {
        console.error('One or more elements not found');
        return;
    }

    function showForm(formToShow: HTMLElement, btnToActivate: HTMLElement) {
        const forms = [signInForm, signUpForm];
        const buttons = [showSignInBtn, showSignUpBtn];
        forms.forEach(form => {
            if (form === formToShow) {
                form.classList.remove('opacity-0', 'max-h-0');
                form.classList.add('opacity-100', 'max-h-screen');
            } else {
                form?.classList.add('opacity-0', 'max-h-0');
                form?.classList.remove('opacity-100', 'max-h-screen');
            }
        });
        buttons.forEach(btn => {
            if (btn === btnToActivate) {
                btn.classList.add('bg-primary-color', 'text-white');
                btn.classList.remove('bg-subtle-background', 'text-foreground-color');
            } else {
                btn?.classList.remove('bg-primary-color', 'text-white');
                btn?.classList.add('bg-subtle-background', 'text-foreground-color');
            }
        });
    }
    showSignInBtn.addEventListener('click', () => showForm(signInForm, showSignInBtn));
    showSignUpBtn.addEventListener('click', () => showForm(signUpForm, showSignUpBtn));
    // Initially show sign-in form
    showForm(signInForm, showSignInBtn);
}