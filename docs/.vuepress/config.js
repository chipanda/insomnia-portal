module.exports = {
  title: `Insomnia's Blog`,
  description: '前端技术小结',
  head: [
    ['link', {
        rel: 'icon',
        href: `/favicon.ico`
    }]
  ],
  themeConfig: {
    sidebar: [
      {
        title: 'React',
        children: [
          '/react/1'
        ]
      },
      {
        title: 'Notes',
        children: [
          '/notes/passive-check'
        ]
      },
    ],
  }
}