PGDMP                        |         
   MemoryGame    16.1    16.1                0    0    ENCODING    ENCODING        SET client_encoding = 'UTF8';
                      false                       0    0 
   STDSTRINGS 
   STDSTRINGS     (   SET standard_conforming_strings = 'on';
                      false                       0    0 
   SEARCHPATH 
   SEARCHPATH     8   SELECT pg_catalog.set_config('search_path', '', false);
                      false                       1262    16398 
   MemoryGame    DATABASE     n   CREATE DATABASE "MemoryGame" WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'C';
    DROP DATABASE "MemoryGame";
                postgres    false                        2615    2200    public    SCHEMA        CREATE SCHEMA public;
    DROP SCHEMA public;
                pg_database_owner    false                        0    0    SCHEMA public    COMMENT     6   COMMENT ON SCHEMA public IS 'standard public schema';
                   pg_database_owner    false    4            �            1259    16399    Users    TABLE     !   CREATE TABLE public."Users" (
);
    DROP TABLE public."Users";
       public         heap    postgres    false    4            �            1259    16433    rooms    TABLE     �   CREATE TABLE public.rooms (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    password character varying(255),
    player character varying(255) NOT NULL
);
    DROP TABLE public.rooms;
       public         heap    postgres    false    4            �            1259    16432    rooms_id_seq    SEQUENCE     �   CREATE SEQUENCE public.rooms_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 #   DROP SEQUENCE public.rooms_id_seq;
       public          postgres    false    219    4            !           0    0    rooms_id_seq    SEQUENCE OWNED BY     =   ALTER SEQUENCE public.rooms_id_seq OWNED BY public.rooms.id;
          public          postgres    false    218            �            1259    16413    users    TABLE     �   CREATE TABLE public.users (
    id integer NOT NULL,
    login character varying(50) NOT NULL,
    password character varying(255) NOT NULL,
    admin boolean NOT NULL
);
    DROP TABLE public.users;
       public         heap    postgres    false    4            �            1259    16412    users_id_seq    SEQUENCE     �   CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 #   DROP SEQUENCE public.users_id_seq;
       public          postgres    false    217    4            "           0    0    users_id_seq    SEQUENCE OWNED BY     =   ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;
          public          postgres    false    216            }           2604    16436    rooms id    DEFAULT     d   ALTER TABLE ONLY public.rooms ALTER COLUMN id SET DEFAULT nextval('public.rooms_id_seq'::regclass);
 7   ALTER TABLE public.rooms ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    219    218    219            |           2604    16416    users id    DEFAULT     d   ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);
 7   ALTER TABLE public.users ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    216    217    217                      0    16399    Users 
   TABLE DATA           !   COPY public."Users"  FROM stdin;
    public          postgres    false    215   �                 0    16433    rooms 
   TABLE DATA           ;   COPY public.rooms (id, name, password, player) FROM stdin;
    public          postgres    false    219                    0    16413    users 
   TABLE DATA           ;   COPY public.users (id, login, password, admin) FROM stdin;
    public          postgres    false    217   *       #           0    0    rooms_id_seq    SEQUENCE SET     :   SELECT pg_catalog.setval('public.rooms_id_seq', 9, true);
          public          postgres    false    218            $           0    0    users_id_seq    SEQUENCE SET     ;   SELECT pg_catalog.setval('public.users_id_seq', 11, true);
          public          postgres    false    216            �           2606    16440    rooms rooms_pkey 
   CONSTRAINT     N   ALTER TABLE ONLY public.rooms
    ADD CONSTRAINT rooms_pkey PRIMARY KEY (id);
 :   ALTER TABLE ONLY public.rooms DROP CONSTRAINT rooms_pkey;
       public            postgres    false    219                       2606    16422    users unique_login 
   CONSTRAINT     N   ALTER TABLE ONLY public.users
    ADD CONSTRAINT unique_login UNIQUE (login);
 <   ALTER TABLE ONLY public.users DROP CONSTRAINT unique_login;
       public            postgres    false    217            �           2606    16420    users users_login_key 
   CONSTRAINT     Q   ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_login_key UNIQUE (login);
 ?   ALTER TABLE ONLY public.users DROP CONSTRAINT users_login_key;
       public            postgres    false    217            �           2606    16418    users users_pkey 
   CONSTRAINT     N   ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);
 :   ALTER TABLE ONLY public.users DROP CONSTRAINT users_pkey;
       public            postgres    false    217                  x������ � �            x���4426��\�Ȝ=... K��         I   x�3�,-N-2��H,��742�L�2�tL��̃� �.��Ĕ����N��	P�)��r�� ����� g�     