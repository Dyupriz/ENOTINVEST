import { Divider, LinearProgress, List, ListItem, ListItemText } from '@mui/material';
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { Box } from '@mui/system';
import ReactPlayer from 'react-player';
import logo from '../../Drawer/logo.png';

export default function AllNewsBlock({ spinner, Item }) {
  const { loading, setLoading } = spinner;
  const dispatch = useDispatch();
  const listFromRSS = useSelector((store) => store.news);
  const listFromChanelInvestFuture = useSelector((store) => store.youtube);
  const listOfConcatNews = useSelector((store) => store.allNews);

  // Получаем данные с API YouTube и записываем в Redux
  // useEffect(() => {
  //   // По необходимости нужно добавить различные свойства к запросу, например сортировка.
  //   axios.get('https://youtube.googleapis.com/youtube/v3/search?part=snippet&channelId=UC-WK8QlQJpAROCrO7dRvqcw&maxResults=3&key=AIzaSyBPSvvF8PBigMy9OHJv2N3FrSIE7zeYigo')
  //     .then((listFromChanelInvestFuture) => {
  //       const { items } = listFromChanelInvestFuture.data
  //       // console.log('====> Видео с канала InvestFuture', items);
  //       if (items.length) {
  //         const sortedArray = sortedByPublishedDate(items)
  //         dispatch({ type: 'SET_ALL_YOUTUBE_VIDEO', payload: sortedArray })
  //         setLoading(false)
  //       }
  //     })
  //     .catch(error => console.log(error))
  // }, [])

  // Получаем данные RSS новостей с сервера и записываем в Redux
  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_API_URL}api/rssnews`)
      .then((listFromRSS) => {
        const { data } = listFromRSS;
        if (data.length) {
          const sortedArray = sortedByPublishedDate(data);
          dispatch({ type: 'SET_ALL_NEWS', payload: sortedArray });
          setLoading(false);
        }
      });
  }, []);

  // Функция совмещающая и сортирующая два массива
  const combinedAndSortNews = (array1, array2) => {
    const concatArray = array1.concat(array2);
    const sortedArray = sortedByPublishedDate(concatArray);
    dispatch({ type: 'SET_NEWS_AND_YOUTUBE_TOGETHER', payload: sortedArray });
    setLoading(false);
  };

  // Функция сортировки по дате публикации новости или ролика
  const sortedByPublishedDate = (array) => {
    const sortedArray = array.sort((a, b) => {
      const newsElemA = a?.pubDate?.replace(/[A-Z-:\s]/gim, '').trim();
      const newsElemB = b?.pubDate?.replace(/[A-Z-:\s]/gim, '').trim();
      const youtubeElemA = a?.snippet?.publishedAt
        ?.replace(/[A-Z-:]/gim, '')
        .trim();
      const youtubeElemB = b?.snippet?.publishedAt
        ?.replace(/[A-Z-:]/gim, '')
        .trim();
      if ((newsElemA || youtubeElemA) > (newsElemB || youtubeElemB)) {
        return -1;
      }
      if ((newsElemA || youtubeElemA) < (newsElemB || youtubeElemB)) {
        return 1;
      }
      return 0;
    });
    return sortedArray;
  };

  // Эффект на вызов совмещающей функции.
  // Если функцию вызвать просто в теле компонента то уходит в зацикливание
  useEffect(() => {
    combinedAndSortNews(listFromRSS, listFromChanelInvestFuture);
  }, [listFromRSS]);

  // Модель плеера с адаптивным дизайном
  const ResponsivePlayer = (videoId) => {
    // Для получения ссылки на видео, напишем функцию с добавлением ID каждого видео
    const videoUrl = (videoId) => {
      return `https://www.youtube.com/watch?v=${videoId}`;
    };

    return (
      <div className="player-wrapper">
        <ReactPlayer
          className="react-player"
          url={videoUrl(videoId)}
          width="100%"
          height="100%"
        />
      </div>
    );
  };

  return loading ? (
    <Box sx={{ width: '100%' }}>
      <LinearProgress />
    </Box>
  ) : (
    <List sx={{ width: '100%', maxWidth: 360, bgcolor: '#eaeaea', mt: 0, pt: 0 }} >
      {listOfConcatNews &&
        listOfConcatNews.map((elem, index) => {
          if (elem.title) {
            return (
              <>
                <ListItem alignItems="flex-start" key={index} sx={{
                  flexDirection: 'row',
                  flexWrap: 'nowrap',
                  alignItems: 'center',
                  width: '100%'
                }}>

                  <Box
                    component="img"
                    sx={{
                      background: 'grey',
                      borderRadius: 2,
                      width: 120,
                      maxHeight: { xs: 233, md: 167 },
                      maxWidth: { xs: 350, md: 250 },
                      objectFit: 'contain',
                      mr: 2,
                    }}
                    alt="The today news"
                    src={elem.enclosure?.url || logo}
                  />

                  <ListItemText
                    secondary={
                      <a
                        href={elem.link}
                        className="elem-link"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {elem.title}
                      </a>
                    }
                    sx={{ width: 300 }}
                  />

                </ListItem>
                <Divider variant="middle" />
              </>
            );
          } else {
            return (
              <>
                  <Box
                    key={elem.id.videoId}
                    sx={{
                      width: '100%',
                      mb: 1,
                    }}
                  >
                    {ResponsivePlayer(elem.id.videoId)}
                    <p style={{ color: '#202124', marginBottom: 0 }}>{elem.snippet.title}</p>
                  </Box>
                  <Divider variant="middle" sx={{ mb: 1 }}/>
                </>
            );
          }
        })}
    </List>
  );
}

// return loading ? (
//     <Box sx={{ width: '100%' }}>
//       <LinearProgress />
//     </Box>
//   ) : (
//     <Stack spacing={2}>
//       {listOfConcatNews &&
//         listOfConcatNews.map((elem, index) => {
//           if (elem.title) {
//             return (
//               <Item
//                 key={index}
//                 sx={{
//                   display: 'flex',
//                   flexDirection: 'row',
//                   alignItems: 'center',
//                 }}
//               >
//                 <img
//                   src={elem.enclosure?.url || logo}
//                   style={{ width: 120, objectFit: 'contain' }}
//                   alt=""
//                 />
//                 <a
//                   href={elem.link}
//                   className="elem-link"
//                   style={{ marginLeft: 10, textAlign: 'start' }}
//                   target="_blank"
//                   rel="noopener noreferrer"
//                 >
//                   {elem.title}
//                 </a>
//               </Item>
//             );
//           } else {
//             return (
//               <Item key={elem.id.videoId}>
//                 {ResponsivePlayer(elem.id.videoId)}
//                 <p style={{ color: '#202124', marginBottom: 0 }}>
//                   {elem.snippet.title}
//                 </p>
//               </Item>
//             );
//           }
//         })}
//     </Stack>
//   );
