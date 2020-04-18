import React, { useState, useEffect } from 'react';
import { Grid, TextField, Button, Divider } from '@material-ui/core';
import axios from 'axios';
import socketIOClient from "socket.io-client";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default () => {
  const [state, setState] = useState({
    screen: 'login',
    email: '',
    password: '',
    file: null,
    profile_image: null,
    _id: null,
    token: null,
    feed: []
  })

  const { feed, token, email, password, file, screen, profile_image } = state;

  useEffect(() => {
    init();
  }, [])

  const init = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      const _id = localStorage.getItem('_id');
      const email = localStorage.getItem('email');
      const profile_image = localStorage.getItem('profile_image');
      console.log(profile_image)
      onChangeScreen('feed');
      await setState(prev => ({
        ...prev,
        email,
        profile_image: profile_image ? profile_image === 'undefined' ? null : profile_image : null,
        token,
        _id
      }))
      const socket = socketIOClient('http://localhost:8080');
      console.log('Subto:', _id)
      socket.on(_id, data => {
        console.log('SOCKET:', data);
        if(data.profile_image) {
          toast(<div className="superlike-toast">
            <img src={data.profile_image || '/default.png'} alt="superlike user" />
            <span>{data.email} SuperLiked your photo!</span>
          </div>, {
            position: "top-right",
            autoClose: 10000,
            hideProgressBar: true,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });
        } else if (data.email) {
          toast('👍 ' + data.email + ' liked your photo!', {
            position: "top-right",
            autoClose: 10000,
            hideProgressBar: true,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });
        }
      })
    }
    fetchFeed(token);
  }

  const fetchFeed = (token) => {
    axios.get('http://localhost:8080/feed', { headers: { 'Authorization': token } }).then(res => {
      const { data: { status, result } } = res;
      if (status === 200) {
        setState(prev => ({
          ...prev,
          feed: result
        }))
      }
    }).catch(err => {
      console.log(err.response)
    })
  }

  const onClickUpload = () => {
    if (!file) return alert('Please select a file!');
    const formData = new FormData();
    formData.append('file', file);
    const url = 'http://localhost:8080/upload';
    axios.post(url, formData, { headers: { Authorization: localStorage.getItem('token') } }).then(res => {
      const profile_image = res.data.result.profile_image;
      localStorage.setItem('profile_image', profile_image)
      setState(prev => ({
        ...prev,
        profile_image
      }))
    }).catch(err => {
      console.log(err);
    });
  }

  const onClickLogout = () => {
    localStorage.clear();
    onChangeScreen('login');
  }

  const onClickLike = account => {
    const url = `http://localhost:8080/like/${account}`;
    axios.get(url, { headers: { Authorization: token } }).then(res => {
      console.log(res)
    }).catch(err => {
      console.log(err.response)
    })
  }

  const onClickSuperLike = account => {
    const url = `http://localhost:8080/superlike/${account}`;
    axios.get(url, { headers: { Authorization: token } }).then(res => {
      console.log(res)
    }).catch(err => {
      console.log(err.response)
    })
  }

  const onClickBlock = account => {
    const url = `http://localhost:8080/block/${account}`;
    axios.get(url, { headers: { Authorization: token } }).then(res => {
      console.log(res)
    }).catch(err => {
      console.log(err.response)
    })
  }

  const onChangeScreen = value => setState(prev => ({ ...prev, screen: value }))

  const onChange = e => {
    const { name, value } = e.target;
    if (name === 'file') {
      setState(prev => ({
        ...prev,
        file: e.target.files[0]
      }))
    } else {
      setState(prev => ({
        ...prev,
        [name]: value
      }))
    }
  }

  const onSubmit = e => {
    e.preventDefault();
    if (screen === 'signup') {
      axios.post('http://localhost:8080/signup', {
        email,
        password
      }).then(res => {
        const { status, message } = res.data;
        if (status === 200) {
          alert('Account Created Successfully! Please login!')
          onChangeScreen('login');
        } else alert(message || 'Something went wrong!');
      }).catch(err => {
        console.log(err);
      })
    } else {
      axios.post('http://localhost:8080/login', {
        email,
        password
      }).then(res => {
        const { status, message, result } = res.data;
        if (status === 200) {
          localStorage.setItem('_id', result._id);
          localStorage.setItem('token', result.token);
          localStorage.setItem('email', email);
          localStorage.setItem('profile_image', result.profile_image);
          setState(prev => ({
            ...prev,
            _id: result._id,
            token: result.token,
            email,
            profile_image: result.profile_image
          }))
          onChangeScreen('feed');
          fetchFeed(result.token)
        } else alert(message || 'Something went wrong!');
      }).catch(err => {
        const { message } = err.response ? err.response.data : {};
        alert(message || 'Something went wrong!');
      })
    }
  }

  const renderScreen = () => {
    if (screen === 'signup')
      return (
        <>
          <h1>Signup</h1>
          <form onSubmit={onSubmit}>
            <TextField required label="Enter your email" name="email" value={email} onChange={onChange} fullWidth type="email" />
            <br />
            <br />
            <TextField required label="Create a new password" name="password" value={password} onChange={onChange} fullWidth type="password" />
            <br />
            <br />
            <Button type="submit" color="primary" variant="contained">Create Account</Button>
            <br />
            <br />
            <Button onClick={() => onChangeScreen('login')}>Already have an account? Login</Button>
          </form>
        </>
      )
    else if (screen === 'login')
      return (
        <>
          <h1>Login</h1>
          <form onSubmit={onSubmit}>
            <TextField required name="email" value={email} onChange={onChange} fullWidth type="email" label="Enter your email" />
            <br />
            <br />
            <TextField required name="password" value={password} onChange={onChange} fullWidth type="password" label="Enter your password" />
            <br />
            <br />
            <Button type="submit" color="primary" variant="contained">Login</Button>
            <br />
            <br />
            <Button onClick={() => onChangeScreen('signup')}>Don't have an account? Signup</Button>
          </form>
        </>
      )
    else return (
      <>
        <div className="feed-top-container">
          <div>
            <img src={profile_image || '/default.png'} alt="Not found!" />
          </div>
          <div>
            <h1>Welcome {email}</h1>
            <Button color="secondary" variant="contained" onClick={onClickLogout}>Logout</Button>
          </div>
        </div>
        {!profile_image && (
          <>
            <br />
            <br />
            <h4>Add a profile image</h4>
            <TextField name="file" onChange={onChange} variant="outlined" type="file" />
            <Button style={{ padding: '15px 24px', margin: '0 0 0 8px' }} color="primary" variant="contained" onClick={onClickUpload}>Upload</Button>
          </>
        )}
        <br />
        <br />
        <Divider />
        <h2>{feed.length ? 'Explore' : 'Loading...'}</h2>
        <Grid container>
          {feed.map(profile => (
            <Grid item xs={4}>
              <div className="feed-card">
                <img src={profile.profile_image} alt="Not found!" />
                <div className="feed-card__bottom">
                  <Button onClick={() => onClickLike(profile._id)}>Like</Button>
                  <Button color="primary" onClick={() => onClickSuperLike(profile._id)}>SuperLike</Button>
                  <Button fullWidth color="secondary" onClick={() => onClickBlock(profile._id)}>Block</Button>
                </div>
              </div>
            </Grid>
          ))}
        </Grid>
      </>
    )
  }

  return (
    <Grid className="main-container" container justify="center">
      <Grid item xs={5}>
        {renderScreen()}
      </Grid>
      <ToastContainer />
    </Grid>
  )
}