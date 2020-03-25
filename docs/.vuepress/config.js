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
        collapsable: false,
        children: [
          '/react/15code'
        ]
      },
      {
        title: 'JavaScript',
        collapsable: false,
        children: [
          ['/js/prototype', '原型链'],
          '/js/deepcopy',
          '/js/decorator',
        ]
      },
      {
        title: 'Notes',
        collapsable: false,
        children: [
          '/notes/passive-check'
        ]
      },
    ],
  }
}