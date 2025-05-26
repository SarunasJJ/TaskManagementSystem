import React from 'react';
import { TextField, Box, InputAdornment, IconButton } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';

const FormField = ({
                       label,
                       name,
                       value,
                       onChange,
                       error,
                       helperText,
                       type = 'text',
                       multiline = false,
                       rows = 1,
                       maxLength,
                       placeholder,
                       required = false,
                       startIcon,
                       showPasswordToggle = false,
                       showPassword = false,
                       onTogglePassword,
                       ...props
                   }) => {
    const actualType = showPasswordToggle ? (showPassword ? 'text' : 'password') : type;

    const getHelperText = () => {
        if (error) return error;
        if (helperText) return helperText;
        if (maxLength) return `${value.length}/${maxLength} characters`;
        return '';
    };

    return (
        <TextField
            fullWidth
            label={label}
            name={name}
            value={value}
            onChange={onChange}
            error={!!error}
            helperText={getHelperText()}
            type={actualType}
            multiline={multiline}
            rows={multiline ? rows : undefined}
            placeholder={placeholder}
            required={required}
            inputProps={{ maxLength }}
            InputProps={{
                startAdornment: startIcon && (
                    <InputAdornment position="start">
                        {startIcon}
                    </InputAdornment>
                ),
                endAdornment: showPasswordToggle && (
                    <InputAdornment position="end">
                        <IconButton onClick={onTogglePassword} edge="end">
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                    </InputAdornment>
                ),
            }}
            {...props}
        />
    );
};

export default FormField;
