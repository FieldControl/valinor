import React, { useEffect, useState } from 'react';
import api from '../../utils/api';

import {Container, Achor} from './styles'

interface TagsProps {
  name: string
}

const Tags: React.FC<TagsProps> =  ({name}) => {

  const [tags, setTags] = useState([] as string[])

  useEffect(() => {
    api.get(`/repos/${name}/topics`, {
      headers: {
        "Accept": "application/vnd.github.mercy-preview+json"
      }
    }).then((response) => {
      setTags(response.data["names"])
    })
  }, [name])

  return (
    <Container>

      {
        tags.map((tag, index) => {
          <li key={index}>
            <Achor to='#'>{tag}</Achor>
          </li>
        })
      }

    </Container>
  )
}

export default Tags