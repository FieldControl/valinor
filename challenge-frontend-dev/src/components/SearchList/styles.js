import styled from 'styled-components';

export const SearchList = styled.ul`
  padding-top: 30px;
  margin-top: 30px;
  list-style: none;

  h2 {
    padding: 16px 0;
    border-bottom: 1px solid #eee;
  }

  li {
    padding: 15px 10px;

    & + li {
      border-top: 1px solid #eee;
    }

    a {
      font-size: 16px;
      color: #0066cc;
      text-decoration: none;
      padding: 0 6px;

      &:hover {
        text-decoration: underline;
      }

      em {
        font-weight: bold;
      }
    }

    p {
      padding: 0 6px;
      margin-top: 5px;
      font-size: 13px;
      color: #999;

      span {
        margin-left: 17px;
        font-size: 15px;
        color: #363636;
      }

      div {
        margin-left: 17px;
        a {
          display: flex;
          justify-content: center;
          align-items: center;
          font-size: 12px;
          padding: 0;
          color: #999;

          &:hover {
            color: #0066cc;
            text-decoration: none;
          }
          svg {
            margin-right: 3px;
          }
        }
      }
    }

    div {
      display: flex;
    }
  }
`;

export const Pagination = styled.div`
  display: flex;

  button {
    margin-top: 30px;
    border: 1px solid #eee;
    background: #fff;
    color: #444;
    border-radius: 4px;
    padding: 5px 8px;
    display: inline-flex;
    line-height: 1;
    align-items: center;
    font-size: 20px;
    transition: all 0.3s;

    &.previous {
      margin-right: auto;
    }

    &.next {
      margin-left: auto;
    }

    &:hover {
      color: #0066cc;
      border-color: #ccc;
      transform: translateY(-2px);
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
    }

    &:active {
      transform: translate(0);
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
    }
  }
`;
