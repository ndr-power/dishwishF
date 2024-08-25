import * as React from 'react';
import { Paper, InputBase, IconButton } from '@mui/material'
import SearchIcon from '@mui/icons-material/Search';
// search bar component
export default function SearchBar(props) {
	const { onChange, value } = props
	return (
		<Paper
      component="form"
      sx={{ p: '2px 4px', display: 'flex', alignItems: 'center', marginBottom: 2 }}
    >
     
      <InputBase
        sx={{ ml: 1, flex: 1 }}
        placeholder="Search"
        onChange={onChange}
        value={value}
        inputProps={{ 'aria-label': 'search' }} 
      />
      <IconButton type="submit" sx={{ p: '10px' }} aria-label="search">
        <SearchIcon />
      </IconButton>
    </Paper>
	);
}