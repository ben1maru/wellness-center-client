// src/components/Posts/PostSearch.jsx
import React, { useState } from 'react';
import { TextField, InputAdornment, IconButton } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

const PostSearch = ({ onSearch, initialQuery = '', placeholder = "Пошук по статтях..." }) => {
  const [searchTerm, setSearchTerm] = useState(initialQuery);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  // Пошук при зміні (з дебаунсом на рівні сторінки) або по кліку/Enter
  const handleSearchSubmit = (event) => {
    // Якщо пошук по Enter або кліку на іконку
    if (event.type === 'click' || (event.type === 'keypress' && event.key === 'Enter')) {
      event.preventDefault(); 
      if (onSearch) {
        onSearch(searchTerm.trim());
      }
    }
  };

  // Якщо ви хочете, щоб пошук спрацьовував при кожному введенні (з дебаунсом на батьківському компоненті)
  // useEffect(() => {
  //   if (onSearch) {
  //     onSearch(searchTerm.trim()); // Батьківський компонент має використовувати useDebounce
  //   }
  // }, [searchTerm, onSearch]);


  return (
    <TextField
      fullWidth
      variant="outlined"
      size="small"
      placeholder={placeholder}
      value={searchTerm}
      onChange={handleSearchChange}
      onKeyPress={handleSearchSubmit} 
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            <IconButton onClick={handleSearchSubmit} edge="end" aria-label="пошук">
              <SearchIcon />
            </IconButton>
          </InputAdornment>
        ),
      }}
      sx={{ my: 2, maxWidth: {sm: 400} }} // Обмеження ширини для кращого вигляду
    />
  );
};

export default PostSearch;