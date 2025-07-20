import { HTTPS_API_URL, meResponse, Match } from "../types.js";
import { getToken } from "../token.js";
import { showToast, ToastType } from "../utils/toast.js";

export const profilePage = (pageContainer: HTMLElement) => {
	pageContainer.innerHTML = `
    <main class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div class="lg:col-span-1">
                <div
                    class="bg-[var(--secondary-color)] rounded-lg p-6 flex flex-col items-center text-center shadow-sm">
                    <div class="relative mb-4">
                        <div id="avatar" class="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-32"
                            style='background-image: url("");'>
                        </div>
                        <label for="avatar-upload"
                            class="absolute bottom-1 right-1 bg-[var(--primary-color)] h-8 w-8 rounded-full flex items-center justify-center text-white hover:bg-blue-600 transition-colors cursor-pointer">
                            <svg fill="currentColor" height="20" viewBox="0 0 256 256" width="20"
                                xmlns="http://www.w3.org/2000/svg">
                                <path
                                    d="M227.31,73.37,182.63,28.68a16,16,0,0,0-22.63,0L36.69,152A15.86,15.86,0,0,0,32,163.31V208a16,16,0,0,0,16,16H92.69A15.86,15.86,0,0,0,104,219.31L227.31,96a16,16,0,0,0,0-22.63ZM92.69,208H48V163.31l88-88L180.69,120ZM192,108.68,147.31,64l24-24L216,84.68Z">
                                </path>
                            </svg>
                        </label>
                        <input type="file" id="avatar-upload" accept="image/*" class="hidden" />
                    </div>
                    <div class="mt-4 flex gap-4">
                        <div class="text-center">
                            <p id="wins-count" class="text-xl font-bold text-[var(--text-primary)]">-</p>
                            <p class="text-sm text-[var(--text-secondary)]">Wins</p>
                        </div>
                        <div class="border-l border-[var(--border-color)]"></div>
                        <div class="text-center">
                            <p id="losses-count" class="text-xl font-bold text-[var(--text-primary)]">-</p>
                            <p class="text-sm text-[var(--text-secondary)]">Losses</p>
                        </div>
                    </div>
                </div>
            </div>
            <div class="lg:col-span-2">
                <div class="space-y-8">
                    <div>
                        <h3 class="text-xl font-bold mb-4 text-[var(--text-primary)]">Account Information</h3>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div class="relative">
                                <label class="text-sm font-medium text-[var(--text-secondary)]"
                                    for="username">Username</label>
                                <input
                                    class="w-full bg-gray-100 border border-[var(--border-color)] rounded-lg p-3 mt-1 text-gray-700 placeholder-gray-500 pr-10"
                                    disabled="" id="user-username" type="text" value="alexryder" />
                                <div
                                    class="absolute inset-y-0 right-0 top-6 flex items-center pr-3 pointer-events-none text-[var(--text-secondary)]">
                                    <svg fill="currentColor" height="20" viewBox="0 0 256 256" width="20"
                                        xmlns="http://www.w3.org/2000/svg">
                                        <path
                                            d="M208,80H176V56a48,48,0,0,0-96,0V80H48A16,16,0,0,0,32,96V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V96A16,16,0,0,0,208,80ZM96,56a32,32,0,0,1,64,0V80H96ZM208,208H48V96H208V208Zm-68-56a12,12,0,1,1-12-12A12,12,0,0,1,140,152Z">
                                        </path>
                                    </svg></div>
                            </div>
                            <div class="relative">
                                <label class="text-sm font-medium text-[var(--text-secondary)]"
                                    for="fullname">Full Name</label>
                                <input 
                                    id="user-name"
                                    class="w-full bg-gray-100 border border-[var(--border-color)] rounded-lg p-3 mt-1 text-gray-700 placeholder-gray-500 pr-10"
                                    disabled="" id="fullname" type="text" value="Alex Ryder" />
                                <div
                                    class="absolute inset-y-0 right-0 top-6 flex items-center pr-3 pointer-events-none text-[var(--text-secondary)]">
                                    <svg fill="currentColor" height="20" viewBox="0 0 256 256" width="20"
                                        xmlns="http://www.w3.org/2000/svg">
                                        <path
                                            d="M208,80H176V56a48,48,0,0,0-96,0V80H48A16,16,0,0,0,32,96V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V96A16,16,0,0,0,208,80ZM96,56a32,32,0,0,1,64,0V80H96ZM208,208H48V96H208V208Zm-68-56a12,12,0,1,1-12-12A12,12,0,0,1,140,152Z">
                                        </path>
                                    </svg></div>
                            </div>
                            <div class="relative md:col-span-2">
                                <label class="text-sm font-medium text-[var(--text-secondary)]"
                                    for="email">Email</label>
                                <input
                                    class="w-full bg-gray-100 border border-[var(--border-color)] rounded-lg p-3 mt-1 text-gray-700 placeholder-gray-500 pr-10"
                                    disabled="" id="user-email" type="email" value="alex.ryder@example.com" />
                                <div
                                    class="absolute inset-y-0 right-0 top-6 flex items-center pr-3 pointer-events-none text-[var(--text-secondary)]">
                                    <svg fill="currentColor" height="20" viewBox="0 0 256 256" width="20"
                                        xmlns="http://www.w3.org/2000/svg">
                                        <path
                                            d="M208,80H176V56a48,48,0,0,0-96,0V80H48A16,16,0,0,0,32,96V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V96A16,16,0,0,0,208,80ZM96,56a32,32,0,0,1,64,0V80H96ZM208,208H48V96H208V208Zm-68-56a12,12,0,1,1-12-12A12,12,0,0,1,140,152Z">
                                        </path>
                                    </svg></div>
                            </div>
                        </div>
                    </div>
                    <div>
                        <h3 class="text-xl font-bold mb-4 text-[var(--text-primary)]">Profile Details</h3>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                            <div>
                                <label class="text-sm font-medium text-[var(--text-secondary)]"
                                    for="nickname">Nickname</label>
                                <input
                                    class="w-full bg-[var(--secondary-color)] border border-[var(--border-color)] rounded-lg p-3 mt-1 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
                                    id="user-nickname" type="text" value="RyderX" />
                            </div>
                            <div>
                                <button id="change-password-btn"
                                    class="w-full bg-[var(--secondary-color)] border border-[var(--border-color)] rounded-lg p-3 text-[var(--text-primary)] font-semibold hover:bg-gray-100 transition-colors">
                                    Change Password
                                </button>
                                <div id="password-fields" class="hidden mt-4 space-y-4">
                                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label class="text-sm font-medium text-[var(--text-secondary)]" for="new-password">New Password</label>
                                            <input id="new-password" type="password" 
                                                class="w-full bg-[var(--secondary-color)] border border-[var(--border-color)] rounded-lg p-3 mt-1 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
                                                placeholder="Enter new password" />
                                        </div>
                                        <div>
                                            <label class="text-sm font-medium text-[var(--text-secondary)]" for="confirm-password">Confirm Password</label>
                                            <input id="confirm-password" type="password" 
                                                class="w-full bg-[var(--secondary-color)] border border-[var(--border-color)] rounded-lg p-3 mt-1 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
                                                placeholder="Confirm new password" />
                                        </div>
                                    </div>
                                    <button id="cancel-password-btn" type="button"
                                        class="w-full bg-gray-100 border border-[var(--border-color)] rounded-lg p-3 text-[var(--text-primary)] font-semibold hover:bg-gray-200 transition-colors">
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div>
                        <h3 class="text-xl font-bold mb-4 text-[var(--text-primary)]">Match History</h3>
                        <div
                            class="overflow-x-auto rounded-lg border border-[var(--border-color)] bg-[var(--secondary-color)]">
                            <table class="w-full text-left">
                                <thead class="bg-gray-50">
                                    <tr>
                                        <th
                                            class="p-4 text-sm font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                                            Winner</th>
                                        <th
                                            class="p-4 text-sm font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                                            Loser</th>
                                        <th
                                            class="p-4 text-sm font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                                            Score</th>
                                        <th
                                            class="p-4 text-sm font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                                            Date</th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-[var(--border-color)]">
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div class="flex justify-end gap-4">
                        <button id="save-changes-btn"
                            class="bg-[var(--primary-color)] rounded-lg px-6 py-2 text-white font-semibold hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                            Save Changes
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </main>
    `;

    const getInfo = async () => {
        const res = await fetch(`${HTTPS_API_URL}/me`, {
            headers: { Authorization: `Bearer ${getToken()}` },
        });

        const data: meResponse = await res.json();
        const matches: Match[] = data.matches;

        // Update the UI with actual data
        const avatarElement = document.getElementById("avatar")!;
        const winsElement = document.getElementById("wins-count")!;
        const lossesElement = document.getElementById("losses-count")!;
        const userNameElement = document.getElementById("user-name")! as HTMLInputElement;
        const userEmailElement = document.getElementById("user-email")! as HTMLInputElement;
        const userNicknameElement = document.getElementById("user-nickname")! as HTMLInputElement;
        const userUsernameElement = document.getElementById("user-username")! as HTMLInputElement;

        winsElement.textContent = data.wins.toString();
        lossesElement.textContent = data.loses.toString();
        userNameElement.value = data.name;
        userEmailElement.value = data.email;
        userNicknameElement.value = data.nickname;
        userUsernameElement.value = data.username;

        if (data.avatar) {
            const imgPath = !data.isGoogleAccount
                ? `${HTTPS_API_URL}/uploads/${data.avatar}`
                : data.avatar;
            avatarElement.style.backgroundImage = `url("${imgPath}")`;
        } else {
            // Google accounts with no images
            const imgPath = `${HTTPS_API_URL}/uploads/default.jpg`;
            avatarElement.style.backgroundImage = `url("${imgPath}")`;
        }

        const avatarUpload = document.getElementById('avatar-upload') as HTMLInputElement;
        const avatarLabel = document.querySelector('label[for="avatar-upload"]') as HTMLElement;
        
        if (data.isGoogleAccount) {
            avatarUpload.disabled = true;
            avatarLabel.classList.add('opacity-50', 'cursor-not-allowed');
            avatarLabel.classList.remove('cursor-pointer', 'hover:bg-blue-600');
        }

        // Update match history table
        const tableBody = document.querySelector('tbody');
        if (tableBody && matches && matches.length > 0) {
            tableBody.innerHTML = '';
            
            matches.forEach(match => {
                const isWinner = match.winner_username === data.username;
                const winnerClass = isWinner ? 'font-bold text-green-500' : '';
                const loserClass = !isWinner ? 'font-bold text-red-500' : '';
                
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td class="p-4 whitespace-nowrap">
                        <span class="${isWinner ? winnerClass : ''}">${match.winner_username}</span>
                    </td>
                    <td class="p-4 whitespace-nowrap">
                        <span class="${!isWinner ? loserClass : 'text-gray-900'}">${isWinner ? match.opponent_username : data.username}</span>
                    </td>
                    <td class="p-4 whitespace-nowrap text-[var(--text-secondary)]">${match.user1_score}-${match.user2_score}</td>
                    <td class="p-4 whitespace-nowrap text-[var(--text-secondary)]">${match.match_date}</td>
                `;
                tableBody.appendChild(row);
            });
        } else if (tableBody) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="4" class="p-4 text-center text-[var(--text-secondary)]">No matches found</td>
                </tr>
            `;
        }
    };

    const updateProfile = async (formData: FormData) => {
        try {
            const token = getToken();
            if (!token) {
                showToast("Authentication required", ToastType.ERROR);
                return;
            }

            const saveBtn = document.getElementById('save-changes-btn') as HTMLButtonElement;
            saveBtn.disabled = true;
            saveBtn.textContent = 'Saving...';

            const response = await fetch(`${HTTPS_API_URL}/update-user/placeholder`, {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            });

            if (response.ok) {
                showToast("Profile updated successfully", ToastType.SUCCESS);
                await getInfo(); // Refresh profile data
                
                // Reset password fields if they were visible
                const passwordFields = document.getElementById('password-fields');
                const changePasswordBtn = document.getElementById('change-password-btn');
                if (passwordFields && !passwordFields.classList.contains('hidden')) {
                    passwordFields.classList.add('hidden');
                    changePasswordBtn!.textContent = 'Change Password';
                    (document.getElementById('new-password') as HTMLInputElement).value = '';
                    (document.getElementById('confirm-password') as HTMLInputElement).value = '';
                }
            } else {
                const error = await response.json();
                showToast(error.error || 'Failed to update profile', ToastType.ERROR);
            }
        } catch (error) {
            console.error('Update profile error:', error);
            showToast('An error occurred while updating profile', ToastType.ERROR);
        } finally {
            const saveBtn = document.getElementById('save-changes-btn') as HTMLButtonElement;
            saveBtn.disabled = false;
            saveBtn.textContent = 'Save Changes';
        }
    };

    const validatePasswords = (): { newPassword: string; isValid: boolean } => {
        const newPassword = (document.getElementById('new-password') as HTMLInputElement).value;
        const confirmPassword = (document.getElementById('confirm-password') as HTMLInputElement).value;
        
        if (!newPassword || !confirmPassword) {
            showToast('Please fill in both password fields', ToastType.ERROR);
            return { newPassword: '', isValid: false };
        }
        
        if (newPassword !== confirmPassword) {
            showToast('Passwords do not match', ToastType.ERROR);
            return { newPassword: '', isValid: false };
        }
        
        const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d).{8,}$/;
    
        if (!passwordRegex.test(newPassword)) {
            showToast('Password must be at least 8 characters long and contain at least one letter and one number', ToastType.ERROR);
            return { newPassword: '', isValid: false };
        }
        
        return { newPassword, isValid: true };
    };

    const handleSaveChanges = async () => {
        const formData = new FormData();
        let hasChanges = false;
        
        // Check for nickname changes
        const nicknameInput = document.getElementById('user-nickname') as HTMLInputElement;
        const currentNickname = nicknameInput.dataset.original || '';
        if (nicknameInput.value.trim() && nicknameInput.value.trim() !== currentNickname) {
            formData.append('nickname', nicknameInput.value.trim());
            hasChanges = true;
        }
        
        // Check for password changes (only if password fields are visible)
        const passwordFields = document.getElementById('password-fields');
        if (passwordFields && !passwordFields.classList.contains('hidden')) {
            const { newPassword, isValid } = validatePasswords();
            if (!isValid) return;
            
            if (newPassword) {
                formData.append('password', newPassword);
                hasChanges = true;
            }
        }
        
        // Check for avatar changes (stored in element data attribute)
        const avatarUpload = document.getElementById('avatar-upload') as HTMLInputElement;
        if (avatarUpload.files && avatarUpload.files[0]) {
            formData.append('avatar', avatarUpload.files[0]);
            hasChanges = true;
        }
        
        if (!hasChanges) {
            showToast('No changes to save', ToastType.ERROR);
            return;
        }
        
        await updateProfile(formData);
    };

    const handleAvatarUpload = (event: Event) => {
        const input = event.target as HTMLInputElement;
        const file = input.files?.[0];
        
        if (file) {
            // Validate file type and size
            if (!file.type.startsWith('image/')) {
                showToast('Please select an image file', ToastType.ERROR);
                input.value = '';
                return;
            }
            
            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                showToast('Image size must be less than 5MB', ToastType.ERROR);
                input.value = '';
                return;
            }
            
            // Preview the image
            const reader = new FileReader();
            reader.onload = (e) => {
                const avatarElement = document.getElementById('avatar')!;
                avatarElement.style.backgroundImage = `url("${e.target?.result}")`;
            };
            reader.readAsDataURL(file);
            showToast('Image selected. Click "Save Changes" to update.', ToastType.SUCCESS);
        }
    };

    const togglePasswordFields = () => {
        const passwordFields = document.getElementById('password-fields');
        const changePasswordBtn = document.getElementById('change-password-btn');
        
        if (passwordFields!.classList.contains('hidden')) {
            passwordFields!.classList.remove('hidden');
            changePasswordBtn!.textContent = 'Hide Password Fields';
        } else {
            passwordFields!.classList.add('hidden');
            changePasswordBtn!.textContent = 'Change Password';
            // Clear password fields
            (document.getElementById('new-password') as HTMLInputElement).value = '';
            (document.getElementById('confirm-password') as HTMLInputElement).value = '';
        }
    };

    const cancelPasswordChange = () => {
        const passwordFields = document.getElementById('password-fields');
        const changePasswordBtn = document.getElementById('change-password-btn');
        
        passwordFields!.classList.add('hidden');
        changePasswordBtn!.textContent = 'Change Password';
        
        // Clear password fields
        (document.getElementById('new-password') as HTMLInputElement).value = '';
        (document.getElementById('confirm-password') as HTMLInputElement).value = '';
    };

	getInfo();

    const nicknameInput = document.getElementById('user-nickname') as HTMLInputElement;
    nicknameInput.dataset.original = nicknameInput.value;

    // Set up event listeners
    const avatarUpload = document.getElementById('avatar-upload') as HTMLInputElement;
    const changePasswordBtn = document.getElementById('change-password-btn') as HTMLButtonElement;
    const cancelPasswordBtn = document.getElementById('cancel-password-btn') as HTMLButtonElement;
    const saveChangesBtn = document.getElementById('save-changes-btn') as HTMLButtonElement;

    avatarUpload?.addEventListener('change', handleAvatarUpload);
    changePasswordBtn?.addEventListener('click', togglePasswordFields);
    cancelPasswordBtn?.addEventListener('click', cancelPasswordChange);
    saveChangesBtn?.addEventListener('click', handleSaveChanges);

    (pageContainer as any)._cleanupListeners = () => {
        avatarUpload?.removeEventListener("change", handleAvatarUpload);
        changePasswordBtn?.removeEventListener("click", togglePasswordFields);
        cancelPasswordBtn?.removeEventListener("click", cancelPasswordChange);
        saveChangesBtn?.removeEventListener("click", handleSaveChanges);
    };
};
