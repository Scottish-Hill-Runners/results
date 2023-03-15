// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface Platform {}
	}

	interface Result {
		raceId: string,
		year: string,
		position: number,
		surname: string,
		forename: string,
		club: string,
		category: string,
		time: string
  	}
  
	type FrontMatter = { [key: string]: any }
}

export {};
