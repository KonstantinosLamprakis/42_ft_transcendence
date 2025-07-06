import { HTTPS_API_URL } from "../types.js";
import { setToken } from "../token.js";

export const loginPage = (pageContainer: HTMLElement) => {
	pageContainer.innerHTML = `
    <main id="auth" class="bg-background-color text-foreground-color" style="font-family: 'Inter', sans-serif;">
        <div class="flex min-h-screen">
            <div class="flex flex-1 flex-col justify-center py-12 px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
                <div class="mx-auto w-full max-w-sm lg:w-96">
                    <div>
                        <h2 class="mt-6 text-3xl font-bold tracking-tight text-foreground-color">Get started</h2>
                        <p class="mt-2 text-sm text-gray-600">
                            Choose your preferred method to continue.
                        </p>
                    </div>
                    <div class="mt-8">
                        <div class="mt-6">
                            <div class="flex gap-4 mb-6">
                                <button
                                    class="flex-1 py-3 px-4 justify-center items-center gap-2 rounded-md bg-subtle-background text-foreground-color text-sm font-semibold shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-color"
                                    id="show-signin-btn">
                                    Sign In
                                </button>
                                <button
                                    class="flex-1 py-3 px-4 justify-center items-center gap-2 rounded-md bg-subtle-background text-foreground-color text-sm font-semibold shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-color"
                                    id="show-signup-btn">
                                    Sign Up
                                </button>
                            </div>
                            <div id="google-signin-button"></div>
                        </div>
                        <form class="mt-8 space-y-6 form-container opacity-0 max-h-0 overflow-hidden" id="signin-form">
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
                                    class="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[var(--primary-color)] hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-color"
                                    type="submit">
                                    Sign In
                                </button>
                            </div>
                        </form>
                        <form class="mt-8 space-y-6 form-container opacity-0 max-h-0 overflow-hidden" id="signup-form">
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
                                    for="name">Full Name</label>
                                <div class="mt-2">
                                    <input
                                        class="block w-full rounded-md border-0 py-2.5 px-3 text-foreground-color shadow-sm ring-1 ring-inset ring-subtle-border placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-color sm:text-sm sm:leading-6"
                                        id="name" name="name" placeholder="Enter your full name" required=""
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
                                    class="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[var(--primary-color)] hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-color"
                                    type="submit">
                                    Sign Up
                                </button>
                            </div>
                        </form>
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
    `;

	const showSignInBtn = document.getElementById("show-signin-btn");
	const showSignUpBtn = document.getElementById("show-signup-btn");
	const signInForm = document.getElementById("signin-form");
	const signUpForm = document.getElementById("signup-form");

	if (!showSignInBtn || !showSignUpBtn || !signInForm || !signUpForm) {
		console.error("One or more elements not found");
		return;
	}

	const showForm = (formToShow: HTMLElement, btnToActivate: HTMLElement) => {
		const forms = [signInForm, signUpForm];
		const buttons = [showSignInBtn, showSignUpBtn];
		forms.forEach((form) => {
			if (form === formToShow) {
				form.classList.remove("opacity-0", "max-h-0");
				form.classList.add("opacity-100", "max-h-screen");
			} else {
				form?.classList.add("opacity-0", "max-h-0");
				form?.classList.remove("opacity-100", "max-h-screen");
			}
		});
		buttons.forEach((btn) => {
			if (btn === btnToActivate) {
				btn.classList.add("bg-[var(--primary-color)]", "opacity-50", "cursor-not-allowed", "text-white");
				btn.classList.remove("hover:bg-gray-200");
			} else {
				btn.classList.remove("bg-[var(--primary-color)]", "opacity-50", "cursor-not-allowed", "text-white");
				btn.classList.add("hover:bg-gray-200");
			}
		});
	}

    const handleSignInClick = () => showForm(signInForm, showSignInBtn);
    const handleSignUpClick = () => showForm(signUpForm, showSignUpBtn);

    const show2FAForm = (username: string) => {
        const authDiv = document.getElementById("auth")!;
        let twofaForm = document.getElementById("twofa-form");
        if (!twofaForm) {
            twofaForm = document.createElement("form");
            twofaForm.id = "twofa-form";
            twofaForm.className = "mt-8 space-y-6 bg-white rounded-lg shadow-sm border border-subtle-border p-6";
            twofaForm.innerHTML = `
                <div class="text-center">
                    <h3 class="text-lg font-semibold text-foreground-color mb-2">Two-Factor Authentication</h3>
                    <p class="text-sm text-gray-600 mb-4">Please enter the 6-digit code from your authenticator app</p>
                </div>
                
                <input name="username" type="hidden" value="${username}" />
                
                <div>
                    <label class="block text-sm font-medium leading-6 text-foreground-color" for="twofa-token">
                        Authentication Code
                    </label>
                    <div class="mt-2">
                        <input
                            name="token"
                            id="twofa-token"
                            type="text"
                            placeholder="000000"
                            required
                            maxlength="6"
                            pattern="[0-9]{6}"
                            class="block w-full rounded-md border-0 py-2.5 px-3 text-foreground-color shadow-sm ring-1 ring-inset ring-subtle-border placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-color sm:text-sm sm:leading-6 text-center text-lg tracking-widest"
                            autocomplete="one-time-code"
                        />
                    </div>
                </div>
                
                <div class="flex gap-3">
                    <button
                        type="button"
                        id="cancel-2fa"
                        class="flex-1 py-3 px-4 border border-subtle-border rounded-md shadow-sm text-sm font-medium text-foreground-color bg-subtle-background hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-color transition-colors">
                        Cancel
                    </button>
                    <button
                        type="submit"
                        class="flex-1 py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[var(--primary-color)] hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-color transition-colors">
                        Verify Code
                    </button>
                </div>
            `;
            
            const mainContainer = document.querySelector('#auth .mx-auto');
            if (mainContainer) {
                mainContainer.appendChild(twofaForm);
            } else {
                authDiv.appendChild(twofaForm);
            }

            const cancelBtn = twofaForm.querySelector('#cancel-2fa') as HTMLButtonElement;
            cancelBtn.addEventListener('click', () => {
                twofaForm?.remove();
            });
        }
        
        // Show the form with animation
        twofaForm.classList.remove("hidden");
        twofaForm.style.opacity = "0";
        twofaForm.style.transform = "translateY(-10px)";
        
        // Animate in
        setTimeout(() => {
            twofaForm!.style.transition = "all 0.3s ease-out";
            twofaForm!.style.opacity = "1";
            twofaForm!.style.transform = "translateY(0)";
        }, 10);

        // Focus the input field
        const tokenInput = twofaForm.querySelector('#twofa-token') as HTMLInputElement;
        setTimeout(() => tokenInput?.focus(), 100);

        twofaForm.onsubmit = async (e) => {
            e.preventDefault();
            const form = e.target as HTMLFormElement;
            const submitBtn = form.querySelector('button[type="submit"]') as HTMLButtonElement;
            
            // Show loading state
            const originalText = submitBtn.textContent;
            submitBtn.textContent = "Verifying...";
            submitBtn.disabled = true;
            
            const username = (form.username as HTMLInputElement).value;
            const tokenVal = (form.token as HTMLInputElement).value;
            
            try {
                const res = await fetch(`${HTTPS_API_URL}/2fa/verify`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ username, token: tokenVal }),
                });
                
                const data = await res.json();
                if (data.token) {
                    setToken(data.token);
                    alert("2FA verified! Logged in.");
                    
                    // Animate out and remove
                    twofaForm!.style.transition = "all 0.3s ease-in";
                    twofaForm!.style.opacity = "0";
                    twofaForm!.style.transform = "translateY(-10px)";
                    setTimeout(() => form.remove(), 300);
                } else {
                    alert(data.error || "2FA verification failed");
                    // Reset button state
                    submitBtn.textContent = originalText;
                    submitBtn.disabled = false;
                    tokenInput.value = "";
                    tokenInput.focus();
                }
            } catch (error) {
                alert("2FA verification failed");
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
                tokenInput.value = "";
                tokenInput.focus();
            }
        };
    }

    const handleSignUpSubmit = async (e: SubmitEvent) => {
		e.preventDefault();
		const form = e.target as HTMLFormElement;
		const formData = new FormData(form);

		formData.forEach((value, key) => {
			console.log(`FormData: ${key} = ${value}`);
		});

		const unusedFields = ["confirm-password", "enable-2fa", "email"];
        const if2FAEnabled = formData.get("enable-2fa") === "on";
        console.log(formData);
		unusedFields.forEach((field) => {
			if (formData.has(field)) {
				formData.delete(field);
				console.log(`Removed unused field: ${field}`);
			}else {
                console.log(`Keep field: ${field}`);
            }
		});

		const res = await fetch(`${HTTPS_API_URL}/signup`, {
			method: "POST",
			body: formData,
		});

		const data = await res.json();
		alert(JSON.stringify(data));

        const username = formData.get("username");
        if (if2FAEnabled && username !== null) {
            setup2FA(username.toString());
        }
	};

    const handleSignInSubmit = async (e: SubmitEvent) => {
		e.preventDefault();
		const form = e.target as HTMLFormElement;
		const body = {
			username: (form.username as HTMLInputElement).value,
			password: (form.password as HTMLInputElement).value,
		};

		const res = await fetch(`${HTTPS_API_URL}/login`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(body),
		});

		const data = await res.json();
		if (data.require2fa) {
			alert("2FA required. Please enter your code.");
			show2FAForm(body.username);
		} else if (data.token) {
			setToken(data.token);
			alert("Logged in!");
		} else {
			alert(data.error || "Login failed");
		}
	};

    // Handle Google Sign-In callback
    const initializeGoogleSignIn = () => {
        if (typeof google !== 'undefined' && google.accounts) {
            google.accounts.id.initialize({
                client_id: "1047975304392-v6d4bg1uvk93ip443tb943eh18qc3bm3.apps.googleusercontent.com",
                callback: handleGoogleSignIn
            });

            const buttonContainer = document.getElementById('google-signin-button');
            if (buttonContainer) {
                google.accounts.id.renderButton(buttonContainer, {
                    theme: 'outline',
                    size: 'large',
                    width: '100%'
                });
            }
        } else {
            setTimeout(initializeGoogleSignIn, 100);
        }
    }

    const handleGoogleSignIn = (response: any) => {
        const idToken = response.credential;
        fetch(`${HTTPS_API_URL}/google-login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ idToken }),
        })
        .then(res => res.json())
        .then(data => {
            if (data.token) {
                setToken(data.token);
                alert("Logged in with Google!");
                // Handle navigation to dashboard/profile
            } else {
                alert(data.error || "Google login failed");
            }
        })
        .catch(error => {
            console.error("Google login error:", error);
            alert("Google login failed");
        });
    }
    
    const setup2FA = async (username: string) => {
        if (!username) return;
        const res = await fetch(`${HTTPS_API_URL}/2fa/setup`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username }),
        });
        const data = await res.json();
        if (data.qr) {
            const qrDiv = document.getElementById("2fa-qr") || document.createElement("div");
            qrDiv.id = "2fa-qr";
            qrDiv.className = "mt-8 bg-white rounded-lg shadow-sm border border-subtle-border p-6 max-w-md mx-auto";
            qrDiv.innerHTML = `
                <div class="text-center space-y-4">
                    <div class="flex items-center justify-center w-12 h-12 mx-auto bg-green-100 rounded-full">
                        <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                    </div>
                    
                    <div>
                        <h3 class="text-lg font-semibold text-foreground-color mb-2">Two-Factor Authentication Setup</h3>
                        <p class="text-sm text-gray-600 mb-6">Secure your account by setting up 2FA with your authenticator app</p>
                    </div>
                    
                    <div class="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <p class="text-sm font-medium text-foreground-color mb-3">Scan this QR code with your authenticator app:</p>
                        <div class="flex justify-center mb-4">
                            <div class="p-3 bg-white rounded-lg shadow-sm border">
                                <img src="${data.qr}" alt="2FA QR Code" class="w-48 h-48 object-contain" />
                            </div>
                        </div>
                    </div>
                    
                    <div class="bg-blue-50 rounded-lg p-4 border border-blue-200">
                        <p class="text-xs font-medium text-blue-800 mb-2">Or enter this secret manually:</p>
                        <div class="bg-white rounded border p-2 break-all font-mono text-xs text-gray-800 select-all cursor-pointer hover:bg-gray-50 transition-colors">
                            ${data.secret}
                        </div>
                        <p class="text-xs text-blue-600 mt-1">Click to select and copy</p>
                    </div>
                    
                    <div class="text-xs text-gray-500 space-y-1">
                        <p>Recommended apps: Google Authenticator, Authy, or Microsoft Authenticator</p>
                    </div>
                    
                    <button
                        onclick="this.parentElement.parentElement.remove()"
                        class="w-full py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400">
                        Close
                    </button>
                </div>
            `;
            
            // Insert the QR div after the main forms container
            const mainContainer = document.querySelector('#auth .mx-auto');
            if (mainContainer) {
                mainContainer.appendChild(qrDiv);
            } else {
                document.getElementById("auth")!.appendChild(qrDiv);
            }
            
            // Add smooth slide-in animation
            qrDiv.style.opacity = "0";
            qrDiv.style.transform = "translateY(-20px)";
            setTimeout(() => {
                qrDiv.style.transition = "all 0.4s ease-out";
                qrDiv.style.opacity = "1";
                qrDiv.style.transform = "translateY(0)";
            }, 10);
            
        } else {
            alert(data.error || "Failed to setup 2FA");
        }
    };

    // Add event listeners
    showSignInBtn.addEventListener("click", handleSignInClick);
    showSignUpBtn.addEventListener("click", handleSignUpClick);
    signInForm.addEventListener("submit", handleSignInSubmit);
    signUpForm.addEventListener("submit", handleSignUpSubmit);

    (pageContainer as any)._cleanupListeners = () => {
        showSignInBtn?.removeEventListener("click", handleSignInClick);
        showSignUpBtn?.removeEventListener("click", handleSignUpClick);
        signInForm?.removeEventListener("submit", handleSignInSubmit);
        signUpForm?.removeEventListener("submit", handleSignUpSubmit);
    };

    // Initialize other components
    initializeGoogleSignIn();
    showForm(signInForm, showSignInBtn);
};
