export default {
  getImage () {
    return {
      id: '302e4bc0-01b7-4ce5-9fcd-6bf333b83860',
      publicId: '1sUMUQ3rqpMPu9RGhJw0fe',
      userId: 'platzigram',
      liked: false,
      likes: 0,
      src: 'https://platzigram.test/1sUMUQ3rqpMPu9RGhJw0fe.jpg',
      description: '#awesome',
      tags: ['#awesome'],
      createdAt: new Date().toString()
    }
  },

  getImages () {
    return [
      this.getImage(),
      this.getImage(),
      this.getImage()
    ]
  },

  getImagesByTag () {
    return [
      this.getImage(),
      this.getImage()
    ]
  },

  getUser () {
    return {
      id: '302e4bc0-01b7-4ce5-9fcd-6bf333b83860',
      name: 'Rene Mar',
      username: 'renemar',
      email: 'rm@platzi.test',
      password: 'pl4tzi',
      createdAt: new Date().toString()
    }
  }

}
