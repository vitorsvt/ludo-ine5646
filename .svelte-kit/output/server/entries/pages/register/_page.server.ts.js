const load = async ({ fetch }) => {
  const response = await fetch("/api/countries");
  const countries = await response.json();
  return {
    countries
  };
};
export {
  load
};
