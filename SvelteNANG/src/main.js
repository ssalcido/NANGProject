import App from './App.svelte';
import { csv } from 'd3-fetch';

/*
	This object has the sheet 'id' and the tab id 'gid'. That's where you data lives

	If you look at a spreadsheet url:

	https://docs.google.com/spreadsheets/d/1W8XUcp44uGqrouqCoRmh-GPWsRXhveti0jZYOu5FQ1M/edit#gid=1900255899
                                          |____________________________________________|         |_________|
                                                                |                                     |
														       'id'                                 'gid'
*/
const sheets = [
    {
	//   "id": "1W8XUcp44uGqrouqCoRmh-GPWsRXhveti0jZYOu5FQ1M", ---> old sheets
	  "id": "14psN2GYNeN5898bbPpeg0PZ5fdCjSm3_M7IqUxbbC0Y",
      "gid": "0"
    },
    {
      "id": "14psN2GYNeN5898bbPpeg0PZ5fdCjSm3_M7IqUxbbC0Y",
      "gid": "854640559"
    }
];

/*
	This async function gets a spreadsheet id and the tab id.

	The function uses an object *destructuring pattern*, so ...
		* function({par1, par2})
	... instead of
		* function(obj)
	
	This makes it more concise and easier to read, we don't need to do
	obj.par1 and obj.par2 inside the function; but par1 and par2 directly,
	or in this case id and gid.

	It uses d3-fetch's csv parser for convenience —so it loads and parses in one call.
	The parse returns an array of objects with the table headers as properties.

	header1 | header2 | header3               [
	---------------------------     =====>      { "header1": 10, "header2": 12, "header3": 13 },
         10 |      12 |      13                 { "header1": 24, "header2": 18, "header3": 0 },
		 24 |      18 |       0                ]
	
*/
const fetchGDocs = async({ id, gid }) => {
	const url = `https://docs.google.com/spreadsheets/u/1/d/${id}/export?format=csv&id=${id}&gid=${gid}`
	const response = await csv(url);	
	return response;
};

/*
	This async function is what gets the ball rolling. It fetches the data and passes it to the newly created App object
	(App as in App.svelte)
	
	The first line is a bit complicated, bit by bit, in reverse, it calls the fetchGDocs function ...
		* fetchGDocs(d)
		
	... for every item in sheets —using map ...
		* sheets.map(d => fetchGDocs(d))

	... inside a Promise.all() method, which takes an iterable (here a map) of promises (fetchDocs is an async function)
	as an input, and resolve when all of the input's promises have resolved, or if the input iterable contains no promises ...
		* Promise.all(sheets.map(d => fetchGDocs(d)))

	... and returns an array of the results of the input promises.
	Here we have *destructured* the array [curated, list] we know Promise.all() resolves to so we can use curated and list later on.
		* const [curated, list] = await Promise.all(sheets.map(d => fetchGDocs(d)));

	Read more here:
	* https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function
	* https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise
	* https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/all
*/
const data = async () => {
	const [curated, list] = await Promise.all(sheets.map(d => fetchGDocs(d)));
	
	const app = new App({
		target: document.body,
		props: {
			curated: curated,
			list: list
		}
	});
}

/*
	Call the function data to ... get the ball rolling (yes, I said it twice)
*/
data();

export default app;