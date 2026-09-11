## What is React?

React is a JavaScript **library** for building user interfaces. Instead of writing raw HTML and manually updating the DOM with JavaScript, React lets you build reusable **components**, small, self-contained pieces of UI that manage their own logic and rendering.

The key idea is: you describe what the UI should look like for a given state, and React figures out how to update the DOM efficiently when that state changes. You don't manually say **find this element and change its text**. You just update the state, and React re-renders the component automatically.

## What is JSX?

JSX looks like HTML inside JavaScript:

```jsx
function Movie() {
  return <div className="App">Movie</div>;
}
```

But it's not actually HTML. It's **JSX**, a syntax extension that React uses. Under the hood, it gets converted to regular JavaScript function calls. So `<div className="App">` becomes `React.createElement("div", { className: "App" })`.

Why `className` instead of `class`? Because `class` is a reserved keyword in JavaScript. JSX is JavaScript at the end of the day, so it uses `className` instead.

## What are components?

A component is basically a **function that returns JSX**. It's a reusable piece of UI.

```jsx
function MoviesList() {
  return <div className="App">Movies List</div>;
}
```

That's it. This is a component. You can use it anywhere by writing `<MoviesList />`. Each component is like a custom HTML tag that you define yourself.

Right now our components are stubs, they just return placeholder text. The idea is to get the app structure and routing working first, then fill in the actual content later. This is called **top-down development**.

## What is `useState`?

`useState` is a React **hook**, a special function that lets you add state to a component.

```jsx
const [user, setUser] = React.useState(null);
```

This gives you two things:

- `user`: the current value (starts as `null`)
- `setUser`: a function to update the value

When you call `setUser(someValue)`, React re-renders the component with the new value. So if `user` changes from `null` to `{ name: "Arsalan" }`, the navbar automatically switches from **Login** to **Logout User** without you manually touching the DOM.

## Why is the user state in `App.js` and not in `Login.js`?

Because multiple components need access to the user:

- The navbar shows Login/Logout based on the user
- `AddReview` needs the user's name and id to submit
- `Movie` might show/hide the review button

If the state was in `Login.js`, other components couldn't access it. By putting it in `App.js` (the parent of everything), it can be **passed down as props** to any child component.

This pattern is called **lifting state up**, if multiple components need the same data, move it to their nearest common ancestor.

## What is React Router and BrowserRouter?

In a regular website, clicking a link sends a request to the server and loads a whole new HTML page. That's slow.

In React, we want **client-side routing**, when you click a link, React just swaps the component on the page without reloading. The URL changes, but the page doesn't reload. It feels instant.

`react-router-dom` is the library that makes this work. And `BrowserRouter` is the component that enables it.

```jsx
<BrowserRouter>
  <App />
</BrowserRouter>
```

By wrapping `<App />` in `<BrowserRouter>`, everything inside the app gets access to routing features, `<Link>`, `<Route>`, `<Routes>`, etc.

We wrap it at the `index.js` level (the very top) so routing is available everywhere in the app.

## `<Link>` and `<a href>`, why not just use normal links?

```jsx
<a href="/movies">Movies</a>

<Link to="/movies">Movies</Link>
```

`<a href>` causes a **full page reload**. The browser makes a new request to the server, downloads the HTML page, and rebuilds everything from scratch.

`<Link to>` uses React Router's client-side navigation. It just **swaps the component** that's rendered, no reload, no re-downloading. The page transition is instant.

## What is conditional rendering?

Sometimes you want to show different things based on some condition. In React, you use a **ternary expression** inside JSX:

```jsx
{
  user ? <a onClick={logout}>Logout User</a> : <Link to={"/login"}>Login</Link>;
}
```

The `?` and `:` work like an if/else. It's a common React pattern for toggling UI elements based on state.

## What is `Routes` and `Route`?

- **`<Route>`** maps a URL path to a component. For instance, **When the URL is `/movies`, render the `<MoviesList />` component.**
- **`<Routes>`** makes sure only **one** route matches at a time. Without it, multiple routes could match and render simultaneously.

```jsx
<Routes>
  <Route exact path="/" element={<MoviesList />}></Route>
  <Route exact path="/movies" element={<MoviesList />}></Route>
  <Route path="/movies/:id/review" element={<AddReview user={user} />}></Route>
  <Route path="/movies/:id/" element={<Movie user={user} />}></Route>
  <Route path="/login" element={<Login login={login} />}></Route>
</Routes>
```

The `exact` keyword means the path must match **exactly**. Without it, `/movies/123` would also match `/movies`.

## What are props?

Props (short for "properties") are how you **pass data from a parent component to a child component**.

```jsx
<Movie user={user} />
<Login login={login} />
<AddReview user={user} />
```

Here, `App.js` is passing:

- The `user` state to `Movie` and `AddReview`, so they know who's logged in
- The `login` function to `Login`, so when the user logs in, it can call `login()` to update the state in `App.js`

Inside the `Login` component, it would receive this as `props.login` (or destructured as `{ login }`). 
Props flow **one way**, from parent to child. The child can't modify the parent's state directly, but it can call a function the parent gave it (like `login()`).

This is how `App.js` stays in control of the user state, but the `Login` component can still trigger a login.

## Why is `/movies/:id/review` defined BEFORE `/movies/:id/`?

```jsx
<Route path="/movies/:id/review" element={<AddReview user={user} />}></Route>
<Route path="/movies/:id/" element={<Movie user={user} />}></Route>
```

Route order matters. If `/movies/:id/` came first, a request to `/movies/123/review` might match `/movies/:id/` with `id = "123/review"` before it gets a chance to match the more specific `/movies/:id/review` route. By putting the **more specific route first**, you avoid this ambiguity.

Think of it like: specific routes first, general routes last.

## Why Bootstrap and React-Bootstrap?

Writing CSS from scratch takes time. **Bootstrap** gives you pre-built CSS classes for common UI patterns, grids, buttons, cards, navbars, forms, etc.

**React-Bootstrap** takes it a step further, instead of writing raw HTML with Bootstrap classes:

```html
<nav class="navbar navbar-expand-lg navbar-light bg-light">...</nav>
```

You write React components:

```jsx
<Navbar bg="light" expand="lg">
  ...
</Navbar>
```

Same result, but cleaner and more **React-like**. The components handle the Bootstrap classes and behavior internally.

## What is Axios and the services layer?

Axios is a library for making HTTP requests from the browser (like `fetch`, but with a cleaner API).

The author puts all API calls in a separate file `services/movies.js` instead of writing `axios.get(...)` directly inside components. Why?

- **One place to manage all API calls** 
  
  If the backend URL changes, you update one file, not every component.

- **Components stay clean.** 

  They just call `MovieDataService.getAll()`, they don't know or care about URLs, HTTP methods, or axios.

```javascript
class MovieDataService {
  getAll(page = 0) {
    return axios.get(`http://localhost:8000/api/v1/movies?page=${page}`);
  }
  createReview(data) {
    return axios.post("http://localhost:8000/api/v1/movies/reviews", data);
  }
  // ...
}
export default new MovieDataService();
```

`export default new MovieDataService()` creates a **single instance** and exports it. So every component that imports it shares the same object.

## What is `useEffect`?

`useEffect` lets you run code **after the component renders**. Its used for side effects, things like fetching data, setting up timers, or subscribing to events.

```jsx
useEffect(() => {
  getMovie(id);
}, [id]);
```

This says: **After this component renders, call `getMovie(id)`. And re-run this whenever `id` changes.**

The second argument `[id]` is the **dependency array**. It controls when the effect runs:

- `[id]`, runs when `id` changes
- `[]`, runs only once (on mount)
- no array, runs after every render (usually not what you want)

Without `useEffect`, you'd have no way to fetch data when a component first appears on screen.