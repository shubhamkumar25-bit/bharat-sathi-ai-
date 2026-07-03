export async function searchJobs(query) {
    console.log("RapidAPI Key:", process.env.RAPIDAPI_KEY);
  const url = `https://jsearch.p.rapidapi.com/search?query=${encodeURIComponent(query)}&page=1&num_pages=1`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "X-RapidAPI-Key": process.env.RAPIDAPI_KEY,
      "X-RapidAPI-Host": "jsearch.p.rapidapi.com",
    },
  });

  const data = await response.json();

  console.log("Status:", response.status);
  console.log("Response:", data);

  if (!response.ok) {
    throw new Error(
      `RapidAPI Error ${response.status}: ${JSON.stringify(data)}`
    );
  }

  return data.data;
}