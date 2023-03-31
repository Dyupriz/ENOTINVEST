import React, { useState, useEffect, useCallback, memo } from 'react';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import TextField from '@mui/material/TextField';
import Checkbox from '@mui/material/Checkbox';
import {
  Accordion,
  AccordionSummary,
  Typography,
  LinearProgress,
  Box,
  Grid,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import StraightOutlinedIcon from '@mui/icons-material/StraightOutlined';
import { styled, alpha } from '@mui/material/styles';
import InputBase from '@mui/material/InputBase';
import FormControlLabel from '@mui/material/FormControlLabel';
import FavoriteBorder from '@mui/icons-material/FavoriteBorder';
import Favorite from '@mui/icons-material/Favorite';
import BookmarksOutlinedIcon from '@mui/icons-material/BookmarksOutlined';
import BookmarksIcon from '@mui/icons-material/Bookmarks';
import { Badge } from 'antd';
import DetailsOfAccordion from './DetailsOfAccordion';

import FavoriteButton from '../FavoriteButton/FavoriteButton';
import SelectUnstyled, {
  selectUnstyledClasses,
} from '@mui/base/SelectUnstyled';
import OptionUnstyled, {
  optionUnstyledClasses,
} from '@mui/base/OptionUnstyled';
import PopperUnstyled from '@mui/base/PopperUnstyled';

const blue = {
  100: '#DAECFF',
  200: '#99CCF3',
  400: '#3399FF',
  500: '#007FFF',
  600: '#0072E5',
  900: '#003A75',
};

const grey = {
  100: '#E7EBF0',
  200: '#E0E3E7',
  300: '#CDD2D7',
  400: '#B2BAC2',
  500: '#A0AAB4',
  600: '#6F7E8C',
  700: '#3E5060',
  800: '#2D3843',
  900: '#1A2027',
};

const StyledButton = styled('button')(
  ({ theme }) => `
  font-family: IBM Plex Sans, sans-serif;
  font-size: 0.875rem;
  box-sizing: border-box;
  min-height: calc(1.5em + 15px);
  min-width: 200px;
  background: ${theme.palette.mode === 'dark' ? grey[900] : '#fff'};
  border: 1px solid ${theme.palette.mode === 'dark' ? grey[800] : grey[300]};
  border-radius: 0.75em;
  margin: 0.5em;
  margin-left: 0px;
  padding: 10px;
  text-align: left;
  line-height: 1.5;
  color: ${theme.palette.mode === 'dark' ? grey[300] : grey[900]};

  &:hover {
    background: #fff3e0;
  }

  &.${selectUnstyledClasses.focusVisible} {
    outline: 3px solid ${theme.palette.mode === 'dark' ? blue[600] : blue[100]};
  }

  &.${selectUnstyledClasses.expanded} {
    &::after {
      content: '▴';
    }
  }

  &::after {
    content: '▾';
    float: right;
  }
  `,
);

const StyledListbox = styled('ul')(
  ({ theme }) => `
  font-family: IBM Plex Sans, sans-serif;
  font-size: 0.875rem;
  box-sizing: border-box;
  padding: 5px;
  margin: 10px 0;
  min-width: 320px;
  background: ${theme.palette.mode === 'dark' ? grey[900] : '#fff'};
  border: 1px solid ${theme.palette.mode === 'dark' ? grey[800] : grey[300]};
  border-radius: 0.75em;
  color: ${theme.palette.mode === 'dark' ? grey[300] : grey[900]};
  overflow: auto;
  outline: 0px;
  `,
);

const StyledOption = styled(OptionUnstyled)(
  ({ theme }) => `
  list-style: none;
  padding: 8px;
  border-radius: 0.45em;
  cursor: default;

  &:last-of-type {
    border-bottom: none;
  }

  &.${optionUnstyledClasses.selected} {
    background-color: ${theme.palette.mode === 'dark' ? blue[900] : blue[100]};
    color: ${theme.palette.mode === 'dark' ? blue[100] : blue[900]};
  }

  &.${optionUnstyledClasses.highlighted} {
    background-color: ${theme.palette.mode === 'dark' ? grey[800] : grey[100]};
    color: ${theme.palette.mode === 'dark' ? grey[300] : grey[900]};
  }

  &.${optionUnstyledClasses.highlighted}.${optionUnstyledClasses.selected} {
    background-color: #ffe0b2;
    color: ${theme.palette.mode === 'dark' ? blue[100] : blue[900]};
  }

  &.${optionUnstyledClasses.disabled} {
    color: ${theme.palette.mode === 'dark' ? grey[700] : grey[400]};
  }

  &:hover:not(.${optionUnstyledClasses.disabled}) {
    background-color: #fff3e0;
    color: ${theme.palette.mode === 'dark' ? grey[300] : grey[900]};
  }
  `,
);

const StyledPopper = styled(PopperUnstyled)`
  z-index: 1;
`;

const CustomSelect = React.forwardRef(function CustomSelect(props, ref) {
  const components = {
    Root: StyledButton,
    Listbox: StyledListbox,
    Popper: StyledPopper,
    ...props.components,
  };

  return <SelectUnstyled {...props} ref={ref} components={components} />;
});

const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: 9,
  height: 43,
  border: 'lightgrey 1px solid',
  backgroundColor: '#ffffff',
  '&:hover': {
    backgroundColor: '#fff3e0',
  },
  margin: '0.5em',
  marginLeft: 0,
  marginRight: 20,
  width: 200,
  // [theme.breakpoints.up('sm')]: {
  //   marginLeft: theme.spacing(1),
  //   width: 'auto',
  // },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'black',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    // vertical padding + font size from searchIcon
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('sm')]: {
      width: '16ch',
      '&:focus': {
        width: '20ch',
      },
    },
  },
}));

const currencies = [
  {
    value: 'Все',
    label: 'Все',
  },
  {
    value: 'USD',
    label: 'USD',
  },
  {
    value: 'RUB',
    label: 'RUB',
  },
];

const favorite = ['ABRD', 'TMOS', 'MTSS'];

function StockAccordion() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user);
  const stocks = useSelector((state) => state.stocks);
  const allNews = useSelector((state) => state.allNews);
  const favorite = useSelector((state) => state.favorite);
  const [filterStocks, setFilterStocks] = useState(stocks);
  const [favoriteStocks, setFavoriteStocks] = useState(stocks);
  const [loading, setLoading] = useState(true);
  const [checked, setChecked] = useState(false);
  const [favchecked, setFavChecked] = useState(false);
  const [stateFilter, setCurrency] = useState('Все');
  const [expanded, setExpanded] = useState(false);

  // Исторические данные по акциям
  const historicalData = useCallback(
    (key, currency, board) => {
      console.log('123')
      if (currency === 'USD') {
        dispatch({ type: 'REMOVE_HISTORY', payload: [] });
        const year = new Date().getFullYear();
        const month = new Date().getMonth() + 1;
        const day = new Date().getDate();
        axios
          .get(
            `https://api.polygon.io/v2/aggs/ticker/${key}/range/1/day/${
              year - 1
            }-0${month}-${day}/${year}-0${month}-${day}?apiKey=MVOp2FJDsLDLqEmq1t6tYy8hXro8YgUh`,
          )
          .then(({ data }) => {
            dispatch({
              type: 'SET_HISTORY',
              payload: data.results?.map((el, i) => {
                return {
                  id: i,
                  price: el.c,
                  date: new Date(el.t).toLocaleDateString('sma-SE'),
                };
              }),
            });
          })
          .catch((err) => console.log('У вас закончился лимит! 1 минута'));
      } else if (currency === 'RUB') {
        dispatch({ type: 'REMOVE_HISTORY', payload: [] });
        const today = new Date();
        const todayOneYearAgo = formatDateMinusYear(today);
        const base_URL = [
          `https://iss.moex.com/iss/history/engines/stock/markets/shares/sessions/total/boards/${board}/securities/${key}.json?from=${todayOneYearAgo}&start=0`,
          `https://iss.moex.com/iss/history/engines/stock/markets/shares/sessions/total/boards/${board}/securities/${key}.json?from=${todayOneYearAgo}&start=100`,
          `https://iss.moex.com/iss/history/engines/stock/markets/shares/sessions/total/boards/${board}/securities/${key}.json?from=${todayOneYearAgo}&start=200`,
        ]; //2022-01-01

        Promise.allSettled(base_URL.map((url) => axios.get(url))).then((data) =>
          data.forEach((result, num) => {
            if (result.status === 'fulfilled') {
              // result.value.data.history.data.map
              dispatch({
                type: 'SET_HISTORY',
                payload: result.value.data.history.data.map((el, i) => {
                  return {
                    id: i + 1,
                    shortName: el[2],
                    date: new Date(el[1]).toLocaleDateString('sma-SE'),
                    price: el[9],
                  };
                }),
              });
            }
            if (result.status === 'rejected') {
              console.log(`Не удалось получить данные по ${num} запросу`);
            }
          }),
        );
      }
    },
    [dispatch],
  );

  useEffect(() => {
    console.log('ОЛЕГ ДЕРЖИ КОНСОЛЬ ЛОГ');
    axios
      .get(`${process.env.REACT_APP_API_URL}api/stocks/ru`)
      .then(({ data }) => {
        if (data.length) {
          dispatch({ type: 'SET_ALL_STOCKS', payload: data });
          setLoading(false);
        }
      });
  }, []);

  // Список всех акций
  // setInterval(() => {
  // useEffect(() => {
  // axios
  //   .get(`${process.env.REACT_APP_API_URL}api/stocks/ru`)
  //   .then(({ data }) => {
  //     if (data.length) {
  //       dispatch({ type: 'SET_ALL_STOCKS', payload: data });
  //       setLoading(false);
  //     }
  //   });
  // }, []);
  // }, 1 * 60 * 1000);

  const AccordionOpen = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  // Ищем информацию о компании в википедии
  const wikipediaSearch = useCallback(
    (elem) => {
      axios
        .post(`${process.env.REACT_APP_API_URL}api/wikipedia`, {
          secid: elem,
        })
        .then((data) => {
          if (data.data) {
            dispatch({ type: 'SET_LINK_OF_WIKIPEDIA', payload: data.data });
            setLoading(false);
          }
        });
    },
    [dispatch],
  );

  const companyInfoSearch = useCallback(
    (secid) => {
      const stocksCopy = [...stocks];
      const info = stocksCopy.filter((el) => el.secid === secid);
      if (info.length === 1) {
        dispatch({
          type: 'SET_CURRENT_COMPANY_INFO',
          payload: info[0].companyinfo,
        });
      } else {
        console.log('Отфильтровалось 0 или более 1 компании');
      }
    },
    [dispatch, stocks],
  );

  // Функция сортировки по дате публикации новости или ролика
  const sortedByPublishedDate = useCallback((array) => {
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
  }, []);

  const newsContentSearch = useCallback(
    (elemName) => {
      const splitName = elemName.split(' ')[0];
      const lowerCaseName = splitName.toLowerCase();
      const upperCaseName = splitName.toUpperCase();
      const arrayOfNews = [...allNews];
      const companyNews = arrayOfNews.filter(
        (elem) =>
          elem.title.includes(splitName || lowerCaseName || upperCaseName) ||
          elem.content?.includes(splitName || lowerCaseName || upperCaseName),
      );
      const firstFiveNews = arrayOfNews.slice(0, 5);
      if (!companyNews.length) {
        dispatch({
          type: 'NEWS_OF_CURRENT_COMPANY',
          payload: sortedByPublishedDate(firstFiveNews),
        });
      } else {
        dispatch({
          type: 'NEWS_OF_CURRENT_COMPANY',
          payload: sortedByPublishedDate(companyNews),
        });
      }
    },
    [allNews, dispatch, sortedByPublishedDate],
  );

  // Сортировка по валюте
  const currencyFilter = useCallback(
    (event) => {
      console.log(event);
      setCurrency(event);
      if (event === 'USD') {
        const filtrstocks = stocks.filter((el) => el.currency === event);
        setFilterStocks(filtrstocks);
      } else if (event === 'RUB') {
        const filtrstocks = stocks.filter((el) => el.currency === event);
        setFilterStocks(filtrstocks);
      } else if (event === 'Все') {
        setFilterStocks(stocks);
      }
    },
    [stocks],
  );

  const searchStock = useCallback(
    (event) => {
      const filtrstocks = stocks.filter(
        (el) =>
          el.secid.slice(0, event.target.value.length) ===
            event.target.value.toUpperCase() ||
          el.shortName.slice(0, event.target.value.length).toLowerCase() ===
            event.target.value.toLowerCase(),
      );
      setFilterStocks(filtrstocks);
    },
    [stocks],
  );

  const FondsCheck = useCallback(
    (event) => {
      setChecked(event.target.checked);
      if (checked === false) {
        const filtrstocks = stocks.filter((el) => el.type === 'Фонд');
        setFilterStocks(filtrstocks);
      } else {
        setFilterStocks(stocks);
      }
    },
    [checked, stocks],
  );

  const FavoriteCheck = useCallback(
    (event) => {
      setFavChecked(event.target.checked);
      const filterFav = favorite.map((el) => el.secid);
      if (favchecked === false) {
        const filtrstocks = stocks.filter((el) => filterFav.includes(el.secid));
        setFilterStocks(filtrstocks);
      } else {
        setFilterStocks(stocks);
      }
    },
    [favchecked, favorite, stocks],
  );

  // Функция форматирования времени для истории (минус год)
  function formatDateMinusYear(date) {
    let month = String(date.getMonth() + 1);
    let day = String(date.getDate());
    const year = String(date.getFullYear() - 1); // отнимаем 1 год
    if (month.length < 2) {
      month = '0' + month;
    }
    if (day.length < 2) {
      day = '0' + day;
    }
    return [year, month, day].join('-');
  }

  const labelCheckBox = { inputProps: { 'aria-label': 'controlled' } };
  const labelFavCheckBox = { inputProps: { 'aria-label': 'controlled' } };
  // Для проверки отфильтрован массив или нет
  const isFiltered = () => {
    return filterStocks.length ? filterStocks : stocks;
  };

  return (
    <>
      <Grid
        container
        spacing={1}
        direction="row"
        justifyContent="flex-start"
        alignItems="center"
      >
        <Grid
          item
        >
          <Search sx={{ display: 'inline-block' }}>
            <SearchIconWrapper>
              <SearchIcon sx={{ color: 'gray' }} />
            </SearchIconWrapper>
            <StyledInputBase
              onChange={(value) => searchStock(value)}
              placeholder="Поиск по акциям"
              inputProps={{ 'aria-label': 'search' }}
            />
          </Search>
        </Grid>

        <Grid
          item
          // xs={12} sm={12} md={4} lg={4} xl={4}
        >
          <CustomSelect
            defaultValue={'Все'}
            value={stateFilter}
            onChange={currencyFilter}
          >
            <StyledOption value={'Все'}>Все</StyledOption>
            <StyledOption value={'USD'}>USD</StyledOption>
            <StyledOption value={'RUB'}>RUB</StyledOption>
          </CustomSelect>
        </Grid>

        <Grid
          item
        >
          <FormControlLabel
            control={
              <Checkbox
                {...labelCheckBox}
                icon={<FavoriteBorder />}
                checkedIcon={<Favorite sx={{ fill: '#ad1457' }} />}
                checked={checked}
                sx={{ marginLeft: '20px' }}
                onChange={FondsCheck}
              />
            }
            label="Фонды"
            sx={{ color: 'black', paddingTop: '6px' }}
          />
          <FormControlLabel
            control={
              <Checkbox
                {...labelFavCheckBox}
                icon={<BookmarksOutlinedIcon />}
                checkedIcon={<BookmarksIcon sx={{ fill: '#ad1457' }} />}
                checked={favchecked}
                sx={{ marginLeft: '20px' }}
                onChange={FavoriteCheck}
              />
            }
            label="Избранное"
            sx={{ color: 'black', paddingTop: '6px' }}
          />
        </Grid>
      </Grid>

      {isFiltered().map((el, index) => {
        return (
          <Accordion
            expanded={expanded === `panel${el.id}`}
            onChange={AccordionOpen(`panel${el.id}`)}
            sx={{ marginTop: '7px', borderRadius: '5px' }}
            key={el.secid}
            onClick={() => {
              wikipediaSearch(el.secid);
              companyInfoSearch(el.secid);
              newsContentSearch(el.shortName);
              historicalData(el.secid, el.currency, el.board);
            }}
          >
            <Badge.Ribbon
              placement="start"
              text={el.secid}
              color={el.lastchange > 0 ? '#004d40' : '#ad1457'}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls={el.id}
                id={el.id}
                sx={{
                  padding: '0 30px 0 70px',
                }}
              >
                <Typography sx={{ width: '3%', flexShrink: 0 }}>
                  {<img src={el.img} width={30} alt="icon" />}
                </Typography>
                <Typography
                  sx={{ width: '33%', flexShrink: 0, paddingTop: '5px' }}
                >
                  {el.shortName}
                </Typography>
                <Typography
                  title="Текущая цена"
                  sx={{ width: '20%', paddingTop: '5px' }}
                >
                  {el.currency === 'USD' ? `${el.last} $` : `${el.last} ₽`}
                </Typography>
                <Typography
                  title="Дневной прирост"
                  sx={{
                    width: '20%',
                    color: `${el.lastchange > 0 ? 'green' : 'red'}`,
                    paddingTop: '5px',
                  }}
                >
                  {el.currency === 'USD'
                    ? `${el.lastchange} $`
                    : `${el.lastchange} ₽`}
                </Typography>
                <StraightOutlinedIcon
                  fontSize="small"
                  sx={{
                    color: `${el.lastchange > 0 ? 'green' : 'red'}`,
                    transform: `${
                      el.lastchange > 0 ? 'rotate(35deg)' : 'rotate(135deg)'
                    }`,
                    marginTop: '7px',
                    paddingBottom: '4px',
                  }}
                />
                <Typography
                  title="Процент изменения за день"
                  sx={{
                    width: '20%',
                    color: `${el.lastchange > 0 ? 'green' : 'red'}`,
                    paddingTop: '5px',
                  }}
                >
                  {el.lastchangeprcnt}%
                </Typography>
                {user.isActivated && <FavoriteButton secid={el.secid} />}
              </AccordionSummary>
            </Badge.Ribbon>
            {expanded === `panel${el.id}` && <DetailsOfAccordion />}
          </Accordion>
        );
      })}
      {loading && (
        <Box sx={{ width: '100%' }}>
          <LinearProgress />
        </Box>
      )}
    </>
  );
}

export default memo(StockAccordion);
