// const { default: axios } = require('axios');
// const { JSDOM } = require('jsdom');

const axios = require('axios');

exports.getMoviesByQuery = async (req, res) => {
  try {
    const {
      genres = 'Action',
      languages = 'en',
      after = null, // pagination cursor
    } = req.body;

    const url = 'https://api.graphql.imdb.com/';

    const body = {
      operationName: 'AdvancedTitleSearch',
      variables: {
        first: 1, // results per page
        after: after || null, // send cursor if available
        genreConstraint: {
          allGenreIds: genres.split(','),
          excludeGenreIds: [],
        },
        languageConstraint: {
          allLanguages: languages.split(','),
        },
        locale: 'en-US',
        sortBy: 'YEAR',
        sortOrder: 'DESC',
        titleTypeConstraint: {
          anyTitleTypeIds: ['movie'],
          excludeTitleTypeIds: [],
        },
      },
      extensions: {
        persistedQuery: {
          sha256Hash:
            '9fc7c8867ff66c1e1aa0f39d0fd4869c64db97cddda14fea1c048ca4b568f06a',
          version: 1,
        },
      },
    };

    const response = await axios.post(url, body, {
      headers: {
        'Content-Type': 'application/json',
        'x-imdb-client-name': 'imdb-web-next',
        'x-imdb-client-version': '0.1.0',
        'x-imdb-user-country': 'IN',
        'x-imdb-language': 'en-US',
        'User-Agent': 'Mozilla/5.0',
      },
    });

    const data = response.data.data.advancedTitleSearch;

    const titles = data.edges.map((e) => e.node.title);

    const nextToken = data.pageInfo?.endCursor || null;
    const hasNextPage = data.pageInfo?.hasNextPage || false;

    res.status(200).json({
      results: titles,
      nextToken,
      hasNextPage,
    });
  } catch (error) {
    console.log(error.response?.data || error);
    res.status(500).send('Error');
  }
};

// // Scraped
// exports.getMoviesByQuery = async (req, res) => {
//   try {
//     const url =
//       // 'https://wwww.example.com';
//       // 'https://www.imdb.com/search/title/?title_type=feature&genres=action,drama&languages=ta';
//       'https://www.imdb.com/search/title/?title_type=feature&genres=action,drama&keywords=life&languages=ta';
//     const htmlData = await axios.get(url, {
//       headers: {
//         'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
//       },
//     });

//     console.log(htmlData.status);

//     const dom = new JSDOM(htmlData.data.toString());

//     const { document } = dom.window;

//     const list = document.querySelectorAll('.ipc-metadata-list-summary-item');

//     const names = [];

//     list.forEach((item) => {
//       const img = item.querySelector('.ipc-image');
//       const thumbUrl = img.getAttribute('src');
//       const a = item.querySelector('.ipc-title-link-wrapper');
//       const name = a.querySelector('h3');
//       const href = a.getAttribute('href');

//       names.push({
//         thumbUrl,
//         name: name.innerHTML,
//         href,
//       });
//     });

//     res.status(200).send(names);
//   } catch (error) {
//     console.log(error);
//     res.status(500).send('Error');
//   }
// };
