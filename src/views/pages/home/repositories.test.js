import { expect, describe, it } from 'vitest'
import { mountWithPinia } from '@/commons/utils/test'
import { beforeEach, afterEach, vi } from 'vitest'
import Index from '@/views/pages/home/index.vue'

describe('Repositories component', () => {
  let wrapper, findAllMock

  beforeEach(() => {
    findAllMock = vi.spyOn(Index.methods, 'findAll')
      .mockImplementation(() => Promise)

    wrapper = mountWithPinia(Index)
  })

  afterEach(() => {
    wrapper.unmount()
    findAllMock.mockReset()
  })

  describe('findAll method', () => {
    it('should fetch repositories', async () => {
      const query = 'bootstrap'
      const page = 1
      const itemsPerPage = 10

      await wrapper.vm.findAll({ page, itemsPerPage }, query)

      expect(findAllMock).toHaveBeenCalledWith({ page: page, itemsPerPage: itemsPerPage }, query)
    })
  })

  describe('selectRepository method', () => {
    it('should open the repository URL in a new window', () => {
      const repository = {
        item: {
          props: {
            title: {
              html_url: 'https://github.com/repo'
            }
          }
        }
      }
      const openMock = vi.spyOn(window, 'open').mockImplementation(() => Promise)

      wrapper.vm.selectRepository(null, repository)

      expect(openMock).toHaveBeenCalledWith('https://github.com/repo')
    })
  })
})
