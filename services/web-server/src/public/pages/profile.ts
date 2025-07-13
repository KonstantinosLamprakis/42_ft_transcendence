import { HTTPS_API_URL } from "../types.js";
import { getToken, isLogged } from "../token.js";

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
                        <button
                            class="absolute bottom-1 right-1 bg-[var(--primary-color)] h-8 w-8 rounded-full flex items-center justify-center text-white hover:bg-blue-600 transition-colors">
                            <svg fill="currentColor" height="20" viewBox="0 0 256 256" width="20"
                                xmlns="http://www.w3.org/2000/svg">
                                <path
                                    d="M227.31,73.37,182.63,28.68a16,16,0,0,0-22.63,0L36.69,152A15.86,15.86,0,0,0,32,163.31V208a16,16,0,0,0,16,16H92.69A15.86,15.86,0,0,0,104,219.31L227.31,96a16,16,0,0,0,0-22.63ZM92.69,208H48V163.31l88-88L180.69,120ZM192,108.68,147.31,64l24-24L216,84.68Z">
                                </path>
                            </svg>
                        </button>
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
                                <button
                                    class="w-full bg-[var(--secondary-color)] border border-[var(--border-color)] rounded-lg p-3 text-[var(--text-primary)] font-semibold hover:bg-gray-100 transition-colors">Change
                                    Password</button>
                            </div>
                            <div
                                class="md:col-span-2 flex items-center justify-between bg-[var(--secondary-color)] rounded-lg p-4 border border-[var(--border-color)]">
                                <p class="text-base font-medium text-[var(--text-primary)]">Two-Factor
                                    Authentication</p>
                                <label
                                    class="relative flex h-[26px] w-[46px] cursor-pointer items-center rounded-full border-none bg-gray-200 p-0.5 has-[:checked]:bg-[var(--primary-color)] transition-colors">
                                    <div class="h-full aspect-square rounded-full bg-white transition-transform duration-300 ease-in-out transform has-[:checked]:translate-x-[20px]"
                                        style="box-shadow: rgba(0, 0, 0, 0.1) 0px 1px 3px 0px, rgba(0, 0, 0, 0.06) 0px 1px 2px 0px;">
                                    </div>
                                    <input checked="" class="invisible absolute" type="checkbox" />
                                </label>
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
                                    <tr>
                                        <td class="p-4 whitespace-nowrap"><span
                                                class="font-bold text-green-500">RyderX</span></td>
                                        <td class="p-4 whitespace-nowrap text-gray-900">ShadowBlade</td>
                                        <td class="p-4 whitespace-nowrap text-[var(--text-secondary)]">2-1</td>
                                        <td class="p-4 whitespace-nowrap text-[var(--text-secondary)]">
                                            2024-01-15</td>
                                    </tr>
                                    <tr>
                                        <td class="p-4 whitespace-nowrap"><span
                                                class="font-bold text-green-500">RyderX</span></td>
                                        <td class="p-4 whitespace-nowrap text-gray-900">NightHawk</td>
                                        <td class="p-4 whitespace-nowrap text-[var(--text-secondary)]">3-0</td>
                                        <td class="p-4 whitespace-nowrap text-[var(--text-secondary)]">
                                            2024-01-10</td>
                                    </tr>
                                    <tr>
                                        <td class="p-4 whitespace-nowrap text-gray-900">ThunderStrike</td>
                                        <td class="p-4 whitespace-nowrap"><span
                                                class="font-bold text-red-500">RyderX</span></td>
                                        <td class="p-4 whitespace-nowrap text-[var(--text-secondary)]">2-1</td>
                                        <td class="p-4 whitespace-nowrap text-[var(--text-secondary)]">
                                            2024-01-05</td>
                                    </tr>
                                    <tr>
                                        <td class="p-4 whitespace-nowrap"><span
                                                class="font-bold text-green-500">RyderX</span></td>
                                        <td class="p-4 whitespace-nowrap text-gray-900">FrostFang</td>
                                        <td class="p-4 whitespace-nowrap text-[var(--text-secondary)]">2-1</td>
                                        <td class="p-4 whitespace-nowrap text-[var(--text-secondary)]">
                                            2023-12-20</td>
                                    </tr>
                                    <tr>
                                        <td class="p-4 whitespace-nowrap"><span
                                                class="font-bold text-green-500">RyderX</span></td>
                                        <td class="p-4 whitespace-nowrap text-gray-900">CrimsonTide</td>
                                        <td class="p-4 whitespace-nowrap text-[var(--text-secondary)]">3-0</td>
                                        <td class="p-4 whitespace-nowrap text-[var(--text-secondary)]">
                                            2023-12-15</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div class="flex justify-end gap-4">
                        <button
                            class="bg-transparent border border-[var(--border-color)] rounded-lg px-6 py-2 text-[var(--text-primary)] font-semibold hover:bg-gray-100 transition-colors">Cancel</button>
                        <button
                            class="bg-[var(--primary-color)] rounded-lg px-6 py-2 text-white font-semibold hover:bg-blue-600 transition-colors">Save
                            Changes</button>
                    </div>
                </div>
            </div>
        </div>
    </main>
    `;

	const getInfo = async () => {
		if (!isLogged()) {
			pageContainer.innerHTML =
				"<p class='text-red-500'>You must be logged in to view your profile.</p>";
			return;
		}

		const res = await fetch(`${HTTPS_API_URL}/me`, {
			headers: { Authorization: `Bearer ${getToken()}` },
		});

		const data = await res.json();

		// Update the UI with actual data
		const avatarElement = document.getElementById("avatar")!;
		const winsElement = document.getElementById("wins-count")!;
		const lossesElement = document.getElementById("losses-count")!;
		const userNameElement = document.getElementById("user-name")! as HTMLInputElement;;
		const userEmailElement = document.getElementById("user-email")! as HTMLInputElement;;
		const userNicknameElement = document.getElementById("user-nickname")! as HTMLInputElement;;
		const userUsernameElement = document.getElementById("user-username")! as HTMLInputElement;;

        console.log(data);
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
		}
	};
	getInfo();
};
